import 'dart:async';
import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/widgets.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';

import '../models/face_anchor_data.dart';
import 'face_tracker_service.dart';

// manages the full lifecycle of a camera + face-tracking session

class ArSessionService with WidgetsBindingObserver {
  Stream<FaceAnchorData> get faceAnchorStream =>
      _faceTrackerService.faceAnchorStream;

  final FaceTrackerService _faceTrackerService = FaceTrackerService();
  CameraController? _cameraController;
  bool _isRunning = false;

  // Serializes all camera operations so init and teardown never overlap.
  Future<void> _cameraLock = Future.value();

  // Callback to notify the UI when the camera controller changes.
  VoidCallback? onStateChanged;

  // Exposed for the UI layer so it can build a CameraPreview.
  CameraController? get cameraController => _cameraController;

  // device capability check
  // on android, face mesh detection requires API 21+, which flutter already requires,
  // so any device that passes the camera check is supported.
  // on ios the same library is used, so the same logic applies.
  static Future<bool> isFaceTrackingSupported() async {
    try {
      final cameras = await availableCameras();
      return cameras.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  Future<void> start() async {
    WidgetsBinding.instance.addObserver(this);
    await _initializeCamera();
  }

  /// Call this from [State.dispose].
  Future<void> stop() async {
    WidgetsBinding.instance.removeObserver(this);
    await _teardownCamera();
    _faceTrackerService.dispose();
  }

  // pauses the camera stream (e.g. user backgrounds the app)
  Future<void> pause() async {
    await _teardownCamera();
  }

  // resumes the camera stream (e.g. user returns from background)
  Future<void> resume() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      await _initializeCamera();
    }
  }

  // ── WidgetsBindingObserver ─────────────────────────────────────────────────

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.paused:
      case AppLifecycleState.detached:
        pause();
        break;
      case AppLifecycleState.resumed:
        resume();
        break;
      case AppLifecycleState.inactive:
      case AppLifecycleState.hidden:
        break;
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  Future<void> _initializeCamera({int retries = 3}) async {
    // Chain onto the lock so this never overlaps with _teardownCamera.
    final completer = Completer<void>();
    _cameraLock = _cameraLock.then((_) async {
      try {
        final cameras = await availableCameras();
        if (cameras.isEmpty) {
          if (retries > 0) {
            completer.complete();
            await Future.delayed(const Duration(seconds: 1));
            // Recurse outside the lock chain to avoid deadlock.
            _initializeCamera(retries: retries - 1);
            return;
          }
          return;
        }

        final frontCamera = cameras.firstWhere(
          (c) => c.lensDirection == CameraLensDirection.front,
          orElse: () => cameras.first,
        );

        _cameraController = CameraController(
          frontCamera,
          ResolutionPreset.low,
          enableAudio: false,
          imageFormatGroup: Platform.isAndroid
              ? ImageFormatGroup.nv21
              : ImageFormatGroup.bgra8888,
        );

        await _cameraController!.initialize();
        onStateChanged?.call();

        // Give the CameraPreview widget time to attach its Surface.
        await Future.delayed(const Duration(milliseconds: 400));

        // Guard: a teardown may have run while we were waiting above.
        if (_cameraController != null && _cameraController!.value.isInitialized) {
          _startStream();
        }
      } catch (_) {
        if (retries > 0) {
          completer.complete();
          await Future.delayed(const Duration(seconds: 1));
          _initializeCamera(retries: retries - 1);
          return;
        }
      } finally {
        if (!completer.isCompleted) completer.complete();
      }
    });
    await completer.future;
  }

  void _startStream() {
    _cameraController?.startImageStream((CameraImage image) {
      _isRunning = true;
      _faceTrackerService.processCameraImage(
        image,
        _cameraController!.description.sensorOrientation,
      );
    });
  }

  Future<void> _teardownCamera() async {
    // Chain onto the lock so this never overlaps with _initializeCamera.
    final completer = Completer<void>();
    _cameraLock = _cameraLock.then((_) async {
      try {
        if (_cameraController == null) return;
        if (_isRunning) {
          try {
            await _cameraController!.stopImageStream();
          } catch (_) {}
          _isRunning = false;
        }
        try {
          await _cameraController!.dispose();
        } catch (_) {}
        _cameraController = null;
        onStateChanged?.call();
      } finally {
        completer.complete();
      }
    });
    await completer.future;
  }
}
