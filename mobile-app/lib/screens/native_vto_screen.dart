import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';
import 'dart:io';
import 'package:flutter/services.dart';

class NativeVtoScreen extends StatefulWidget {
  const NativeVtoScreen({Key? key}) : super(key: key);

  @override
  State<NativeVtoScreen> createState() => _NativeVtoScreenState();
}

class _NativeVtoScreenState extends State<NativeVtoScreen> {
  CameraController? _cameraController;
  FaceMeshDetector? _faceMeshDetector;
  bool _isDetecting = false;
  FaceMesh? _activeFaceMesh;
  Size? _imageSize;
  InputImageRotation? _imageRotation;
  String _debugInfo = "Initializing...";

  @override
  void initState() {
    super.initState();
    _initializeDetectorAndCamera();
  }

  Future<void> _initializeDetectorAndCamera() async {
    _faceMeshDetector = FaceMeshDetector(option: FaceMeshDetectorOptions.faceMesh);

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
      if (_isDetecting) return;
      _isDetecting = true;
      _processImage(image, _cameraController!.description.sensorOrientation);
    });
  }

  Future<void> _processImage(CameraImage image, int sensorOrientation) async {
    final inputImage = _convertCameraImage(image, sensorOrientation);
    if (inputImage == null) {
      _isDetecting = false;
      return;
    }

    try {
      final faceMeshes = await _faceMeshDetector!.processImage(inputImage);
      if (mounted) {
        setState(() {
          if (faceMeshes.isNotEmpty) {
            _activeFaceMesh = faceMeshes.first;
            _imageSize = Size(image.width.toDouble(), image.height.toDouble());
            _imageRotation = inputImage.metadata?.rotation;
            _debugInfo = "Face tracked: ${_activeFaceMesh!.points.length} points";
          } else {
            _activeFaceMesh = null;
            _debugInfo = "Searching for face...";
          }
        });
      }
    } catch (e) {
      print("Error processing face mesh: $e");
    } finally {
      if (mounted) {
        _isDetecting = false;
      }
    }
  }

  InputImage? _convertCameraImage(CameraImage image, int sensorOrientation) {
    final format = InputImageFormatValue.fromRawValue(image.format.raw) ??
        (Platform.isAndroid ? InputImageFormat.nv21 : InputImageFormat.bgra8888);

    final rotation = InputImageRotationValue.fromRawValue(sensorOrientation) ??
        InputImageRotation.rotation0deg;

    final bytes = WriteBuffer();
    for (final plane in image.planes) {
      bytes.putUint8List(plane.bytes);
    }

    return InputImage.fromBytes(
      bytes: bytes.done().buffer.asUint8List(),
      metadata: InputImageMetadata(
        size: Size(image.width.toDouble(), image.height.toDouble()),
        rotation: rotation,
        format: format,
        bytesPerRow: image.planes[0].bytesPerRow,
      ),
    );
  }

  @override
  void dispose() {
    _cameraController?.stopImageStream();
    _cameraController?.dispose();
    _faceMeshDetector?.close();
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
          if (_activeFaceMesh != null && _imageSize != null && _imageRotation != null)
            CustomPaint(
              painter: FaceMeshDebugPainter(
                _activeFaceMesh!,
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
  final FaceMesh faceMesh;
  final Size imageSize;
  final InputImageRotation rotation;

  FaceMeshDebugPainter(this.faceMesh, this.imageSize, this.rotation);

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

    for (final point in faceMesh.points) {
      double x = point.x * scale + offsetX;
      double y = point.y * scale + offsetY;

      // Assume front camera (mirrored)
      x = size.width - x;

      canvas.drawCircle(Offset(x, y), 2, paint);
    }
  }

  @override
  bool shouldRepaint(FaceMeshDebugPainter oldDelegate) {
    return oldDelegate.faceMesh != faceMesh ||
           oldDelegate.imageSize != imageSize ||
           oldDelegate.rotation != rotation;
  }
}
