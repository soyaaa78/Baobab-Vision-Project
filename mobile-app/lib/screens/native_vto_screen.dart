import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';
import 'dart:io';
import '../services/face_tracker_service.dart';
import '../models/face_anchor_data.dart';

class NativeVtoScreen extends StatefulWidget {
  const NativeVtoScreen({Key? key}) : super(key: key);

  @override
  State<NativeVtoScreen> createState() => _NativeVtoScreenState();
}

class _NativeVtoScreenState extends State<NativeVtoScreen> {
  CameraController? _cameraController;
  final FaceTrackerService _faceTrackerService = FaceTrackerService();
  
  FaceAnchorData? _activeAnchorData;
  Size? _imageSize;
  InputImageRotation? _imageRotation;
  String _debugInfo = "Initializing...";

  @override
  void initState() {
    super.initState();
    _initializeDetectorAndCamera();
  }

  Future<void> _initializeDetectorAndCamera() async {
    _faceTrackerService.faceAnchorStream.listen((anchorData) {
      if (!mounted) return;
      setState(() {
        if (anchorData.isTracking) {
          _activeAnchorData = anchorData;
          _debugInfo = "Face tracked: ${anchorData.landmarks.length} points";
        } else {
          _activeAnchorData = null;
          _debugInfo = "Searching for face...";
        }
      });
    });

    final cameras = await availableCameras();
    final frontCamera = cameras.firstWhere(
      (c) => c.lensDirection == CameraLensDirection.front,
      orElse: () => cameras.first,
    );

    _cameraController = CameraController(
      frontCamera,
      ResolutionPreset.high,
      enableAudio: false,
      imageFormatGroup: Platform.isAndroid ? ImageFormatGroup.nv21 : ImageFormatGroup.bgra8888,
    );

    await _cameraController!.initialize();
    if (!mounted) return;

    setState(() {
      _debugInfo = "Camera ready. Searching for face...";
    });

    // Wait for CameraPreview to attach its Surface before reconfiguring
    // the session with an image stream. Without this delay the session
    // closes before the preview surface is ready (mirrors recommender_screen.dart).
    await Future.delayed(const Duration(milliseconds: 400));
    if (mounted) _startStream();
  }

  void _startStream() {
    _cameraController?.startImageStream((CameraImage image) {
      if (!mounted) return;
      // Keep track of the image dimensions and orientation for the debug painter
      _imageSize = Size(image.width.toDouble(), image.height.toDouble());
      _imageRotation = InputImageRotationValue.fromRawValue(_cameraController!.description.sensorOrientation) ?? InputImageRotation.rotation0deg;
      
      _faceTrackerService.processCameraImage(image, _cameraController!.description.sensorOrientation);
    });
  }

  @override
  void dispose() {
    _cameraController?.stopImageStream();
    _cameraController?.dispose();
    _faceTrackerService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: Colors.white)),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Native VTO (Debug)', style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          CameraPreview(_cameraController!),
          if (_activeAnchorData != null && _imageSize != null && _imageRotation != null)
            CustomPaint(
              painter: FaceMeshDebugPainter(
                _activeAnchorData!,
                _imageSize!,
                _imageRotation!,
              ),
            ),
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(12),
              color: Colors.black54,
              child: Text(
                _debugInfo,
                style: const TextStyle(color: Colors.greenAccent, fontSize: 16),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class FaceMeshDebugPainter extends CustomPainter {
  final FaceAnchorData anchorData;
  final Size imageSize;
  final InputImageRotation rotation;

  FaceMeshDebugPainter(this.anchorData, this.imageSize, this.rotation);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.greenAccent
      ..style = PaintingStyle.fill;

    // Handle rotation by swapping dimensions for portrait
    Size previewRenderBoxSize;
    if (rotation == InputImageRotation.rotation90deg || rotation == InputImageRotation.rotation270deg) {
      previewRenderBoxSize = Size(imageSize.height, imageSize.width);
    } else {
      previewRenderBoxSize = imageSize;
    }

    final double arPreview = previewRenderBoxSize.width / previewRenderBoxSize.height;
    final double arContainer = size.width / size.height;

    double scale;
    double offsetX = 0.0;
    double offsetY = 0.0;

    // Calculate scale and offset to match CameraPreview's BoxFit.cover behavior
    if (arPreview > arContainer) {
      scale = size.height / previewRenderBoxSize.height;
      offsetX = (size.width - previewRenderBoxSize.width * scale) / 2;
    } else {
      scale = size.width / previewRenderBoxSize.width;
      offsetY = (size.height - previewRenderBoxSize.height * scale) / 2;
    }

    for (final point in anchorData.landmarks) {
      double x = point.x * scale + offsetX;
      double y = point.y * scale + offsetY;

      // Assume front camera (mirrored)
      x = size.width - x;

      canvas.drawCircle(Offset(x, y), 2, paint);
    }
  }

  @override
  bool shouldRepaint(FaceMeshDebugPainter oldDelegate) {
    return oldDelegate.anchorData != anchorData ||
           oldDelegate.imageSize != imageSize ||
           oldDelegate.rotation != rotation;
  }
}
