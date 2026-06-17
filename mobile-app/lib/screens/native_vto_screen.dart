import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';

import '../models/face_anchor_data.dart';
import '../services/ar_session_service.dart';
import '../services/model_loader_service.dart';
import '../widgets/glasses_renderer.dart';

class NativeVtoScreen extends StatefulWidget {
  final String? model3dUrl;

  const NativeVtoScreen({Key? key, this.model3dUrl}) : super(key: key);

  @override
  State<NativeVtoScreen> createState() => _NativeVtoScreenState();
}

class _NativeVtoScreenState extends State<NativeVtoScreen> {
  final ArSessionService _arSession = ArSessionService();
  final ModelLoaderService _modelLoader = ModelLoaderService();

  FaceAnchorData? _activeAnchorData;
  String _debugInfo = 'Initializing...';
  bool _cameraReady = false;

  String? _currentGlbPath;
  bool _isLoadingModel = false;
  bool _isExiting = false;

  @override
  void initState() {
    super.initState();
    _start();
  }

  Future<void> _start() async {
    _arSession.onStateChanged = () {
      if (mounted) setState(() {});
    };

    if (widget.model3dUrl != null && widget.model3dUrl!.isNotEmpty) {
      _loadModelUrl(widget.model3dUrl!);
    }

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
    _modelLoader.clearCache();
    super.dispose();
  }

  Future<void> _loadModelUrl(String url) async {
    setState(() {
      _isLoadingModel = true;
    });
    try {
      final path = await _modelLoader.loadModelFromUrl(url);
      if (mounted) {
        setState(() {
          _currentGlbPath = path;
          _isLoadingModel = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _debugInfo = 'Error loading model: $e';
          _isLoadingModel = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = _arSession.cameraController;
    final isInitialized = controller != null && controller.value.isInitialized;

    Size? previewSize;
    InputImageRotation? imageRotation;

    if (isInitialized && controller.value.previewSize != null) {
      final p = controller.value.previewSize!;
      previewSize = Size(p.height, p.width);
      imageRotation = InputImageRotationValue.fromRawValue(
            controller.description.sensorOrientation,
          ) ??
          InputImageRotation.rotation0deg;
    }

    // Show spinner + status while session is starting.
    if (!_cameraReady || !isInitialized || previewSize == null) {
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

    return PopScope(
      canPop: true,
      onPopInvoked: (didPop) {
        if (mounted) setState(() => _isExiting = true);
      },
      child: Scaffold(
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
          FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: previewSize.width,
              height: previewSize.height,
              child: CameraPreview(controller),
            ),
          ),

          // 468-point face mesh overlay
          if (_activeAnchorData != null)
            CustomPaint(
              painter: FaceMeshDebugPainter(
                _activeAnchorData!,
                previewSize,
                imageRotation!,
              ),
            ),

          // Proof of Concept 3D Glasses Rendering
          if (!_isExiting && _currentGlbPath != null)
            GlassesRenderer(
              glbPath: _currentGlbPath!,
              faceDataStream: _arSession.faceAnchorStream,
              previewSize: previewSize,
            ),
          if (_isLoadingModel)
            const Center(child: CircularProgressIndicator(color: Colors.white)),

          // Debug status bar
          Positioned(
            top: 100,
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
    ));
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
