import 'dart:async';
import 'dart:io';

import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';
import 'package:vector_math/vector_math_64.dart';

import '../models/face_anchor_data.dart';

class FaceTrackerService {
  final FaceMeshDetector _faceMeshDetector =
      FaceMeshDetector(option: FaceMeshDetectorOptions.faceMesh);

  final StreamController<FaceAnchorData> _faceAnchorStreamController =
      StreamController<FaceAnchorData>.broadcast();

  bool _isProcessing = false;

  // Debounce: delays emitting isTracking=false so brief occlusions
  // (blinks, hand swipes) don't flash the UI.
  Timer? _lostFaceTimer;
  static const _lostFaceCooldown = Duration(milliseconds: 600);

  Stream<FaceAnchorData> get faceAnchorStream =>
      _faceAnchorStreamController.stream;

  Future<void> processCameraImage(
      CameraImage image, int sensorOrientation) async {
    // Drop frame if still processing previous — natural throttle.
    if (_isProcessing) return;
    _isProcessing = true;

    final inputImage = _convertCameraImage(image, sensorOrientation);
    if (inputImage == null) {
      _isProcessing = false;
      return;
    }

    try {
      final faceMeshes = await _faceMeshDetector.processImage(inputImage);

      if (faceMeshes.isNotEmpty) {
        // Multi-face handling: pick the face with the largest bounding box area
        final faceMesh = faceMeshes.reduce((a, b) {
          final aArea = a.boundingBox.width * a.boundingBox.height;
          final bArea = b.boundingBox.width * b.boundingBox.height;
          return aArea >= bArea ? a : b;
        });

        // Face found — cancel any pending "lost" timer.
        _lostFaceTimer?.cancel();
        _lostFaceTimer = null;

        _faceAnchorStreamController.add(_calculateFaceAnchorData(faceMesh));
      } else {
        // Debounce: only declare tracking lost after cooldown.
        _lostFaceTimer ??= Timer(_lostFaceCooldown, () {
          _faceAnchorStreamController.add(FaceAnchorData(
            transform: Matrix4.identity(),
            landmarks: [],
            nosebridge: Vector3.zero(),
            leftEar: Vector3.zero(),
            rightEar: Vector3.zero(),
            faceWidth: 0.0,
            isTracking: false,
          ));
          _lostFaceTimer = null;
        });
      }
    } catch (e) {
      debugPrint('FaceTrackerService error: $e');
    } finally {
      _isProcessing = false;
    }
  }

  FaceAnchorData _calculateFaceAnchorData(FaceMesh faceMesh) {
    final landmarks = faceMesh.points
        .map((p) => Vector3(p.x.toDouble(), p.y.toDouble(), p.z.toDouble()))
        .toList();

    if (landmarks.length < 468) return FaceAnchorData.mock();

    // Standard MediaPipe indices
    final nosebridge = landmarks[8];
    final leftEar = landmarks[234];
    final rightEar = landmarks[454];
    final chin = landmarks[152];
    final forehead = landmarks[10];

    final faceWidth = leftEar.distanceTo(rightEar);

    // Build orthonormal rotation matrix from face axes.
    final xAxis = (rightEar - leftEar).normalized();
    final yAxis = (forehead - chin).normalized();
    final zAxis = xAxis.cross(yAxis).normalized();
    final orthogonalY = zAxis.cross(xAxis).normalized();

    final transform = Matrix4.identity();
    transform.setColumn(0, Vector4(xAxis.x, xAxis.y, xAxis.z, 0.0));
    transform.setColumn(1, Vector4(orthogonalY.x, orthogonalY.y, orthogonalY.z, 0.0));
    transform.setColumn(2, Vector4(zAxis.x, zAxis.y, zAxis.z, 0.0));
    transform.setColumn(3, Vector4(nosebridge.x, nosebridge.y, nosebridge.z, 1.0));

    return FaceAnchorData(
      transform: transform,
      landmarks: landmarks,
      nosebridge: nosebridge,
      leftEar: leftEar,
      rightEar: rightEar,
      faceWidth: faceWidth,
      isTracking: true,
    );
  }

  // Inline byte conversion — no isolate overhead, just a fast memcpy.
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

  void dispose() {
    _lostFaceTimer?.cancel();
    _faceMeshDetector.close();
    _faceAnchorStreamController.close();
  }
}
