import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';

import '../models/face_anchor_data.dart';
import '../services/ar_session_service.dart';

class NativeVtoScreen extends StatefulWidget {
  const NativeVtoScreen({Key? key}) : super(key: key);

  @override
  State<NativeVtoScreen> createState() => _NativeVtoScreenState();
}

class _NativeVtoScreenState extends State<NativeVtoScreen> {
  final ArSessionService _arSession = ArSessionService();

  FaceAnchorData? _activeAnchorData;
  Size? _imageSize;
  InputImageRotation? _imageRotation;
  String _debugInfo = 'Initializing...';
  bool _cameraReady = false;

  @override
  void initState() {
    super.initState();
    _start();
  }

  Future<void> _start() async {
    _arSession.onStateChanged = () {
      if (mounted) setState(() {});
    };

    // Gate: ensure device can support face tracking before we start.
    final supported = await ArSessionService.isFaceTrackingSupported();
    if (!mounted) return;

    if (!supported) {
      setState(() => _debugInfo = 'Face tracking not supported on this device.');
      return;
    }

    await _arSession.start();
    if (!mounted) return;

    setState(() {
      _cameraReady = true;
      _debugInfo = 'Camera ready. Searching for face...';
    });

    // Listen to FaceAnchorData emitted by the session service.
    _arSession.faceAnchorStream.listen((anchorData) {
      if (!mounted) return;
      final controller = _arSession.cameraController;
      setState(() {
        if (anchorData.isTracking && controller != null) {
          _activeAnchorData = anchorData;
          // previewSize on Android is reported as (height × width), so swap.
          final preview = controller.value.previewSize!;
          _imageSize = Size(preview.height, preview.width);
          _imageRotation =
              InputImageRotationValue.fromRawValue(
                controller.description.sensorOrientation,
              ) ??
              InputImageRotation.rotation0deg;
          _debugInfo = 'Face tracked: ${anchorData.landmarks.length} points';
        } else {
          _activeAnchorData = null;
          _debugInfo = 'Searching for face...';
        }
      });
    });
  }

  @override
  void dispose() {
    _arSession.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = _arSession.cameraController;
    final isInitialized = controller != null && controller.value.isInitialized;

    // Show spinner + status while session is starting.
    if (!_cameraReady || !isInitialized) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(color: Colors.white),
              const SizedBox(height: 16),
              Text(
                _debugInfo,
                style: const TextStyle(color: Colors.white70, fontSize: 14),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text(
          'Native VTO (Debug)',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.transparent,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Stack(
        fit: StackFit.expand,
        children: [
          // Live camera feed
          CameraPreview(controller),

          // 468-point face mesh overlay
          if (_activeAnchorData != null &&
              _imageSize != null &&
              _imageRotation != null)
            CustomPaint(
              painter: FaceMeshDebugPainter(
                _activeAnchorData!,
                _imageSize!,
                _imageRotation!,
              ),
            ),

          // Debug status bar
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.all(12),
              color: Colors.black54,
              child: Text(
                _debugInfo,
                style:
                    const TextStyle(color: Colors.greenAccent, fontSize: 16),
                textAlign: TextAlign.center,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Debug Painter ──────────────────────────────────────────────────────────────

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

    // imageSize is already swapped in _start() to match the portrait orientation
    final Size previewRenderBoxSize = imageSize;

    final double arPreview =
        previewRenderBoxSize.width / previewRenderBoxSize.height;
    final double arContainer = size.width / size.height;

    double scale;
    double offsetX = 0.0;
    double offsetY = 0.0;

    // Match CameraPreview's BoxFit.cover behaviour.
    if (arPreview > arContainer) {
      scale = size.height / previewRenderBoxSize.height;
      offsetX = (size.width - previewRenderBoxSize.width * scale) / 2;
    } else {
      scale = size.width / previewRenderBoxSize.width;
      offsetY = (size.height - previewRenderBoxSize.height * scale) / 2;
    }

    for (final point in anchorData.landmarks) {
      double x = point.x * scale + offsetX;
      final double y = point.y * scale + offsetY;

      // Mirror horizontally for front camera.
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
