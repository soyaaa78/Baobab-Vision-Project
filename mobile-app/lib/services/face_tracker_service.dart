import 'dart:async';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';
import 'package:vector_math/vector_math_64.dart';
import 'dart:io';

import '../models/face_anchor_data.dart';

class FaceTrackerService {
  final FaceMeshDetector _faceMeshDetector =
      FaceMeshDetector(option: FaceMeshDetectorOptions.faceMesh);
  
  final StreamController<FaceAnchorData> _faceAnchorStreamController =
      StreamController<FaceAnchorData>.broadcast();

  bool _isProcessing = false;

  Stream<FaceAnchorData> get faceAnchorStream =>
      _faceAnchorStreamController.stream;

  Future<void> processCameraImage(
      CameraImage image, int sensorOrientation) async {
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
        // Use the first detected face (Priority 5 multi-face handling can be added here)
        final faceMesh = faceMeshes.first;
        final faceAnchorData = _calculateFaceAnchorData(faceMesh);
        _faceAnchorStreamController.add(faceAnchorData);
      } else {
        // No face tracking
        _faceAnchorStreamController.add(FaceAnchorData(
          transform: Matrix4.identity(),
          landmarks: [],
          nosebridge: Vector3.zero(),
          leftEar: Vector3.zero(),
          rightEar: Vector3.zero(),
          faceWidth: 0.0,
          isTracking: false,
        ));
      }
    } catch (e) {
      print("Error processing face mesh: $e");
    } finally {
      _isProcessing = false;
    }
  }

  FaceAnchorData _calculateFaceAnchorData(FaceMesh faceMesh) {
    // Convert ML Kit FaceMesh points to Vector3
    final landmarks = faceMesh.points
        .map((p) => Vector3(p.x.toDouble(), p.y.toDouble(), p.z.toDouble()))
        .toList();

    // Standard MediaPipe Face Mesh Indices:
    // Nose bridge (between eyes): 168 or 8
    // Left ear/cheek edge: 234
    // Right ear/cheek edge: 454
    // Chin: 152
    // Forehead: 10
    
    // Ensure we have enough points (ML Kit returns 468 points)
    if (landmarks.length < 468) {
      return FaceAnchorData.mock();
    }

    final nosebridge = landmarks[8];
    final leftEar = landmarks[234];
    final rightEar = landmarks[454];
    
    // Calculate face width
    final faceWidth = leftEar.distanceTo(rightEar);

    // Calculate a basic transformation matrix (Transform)
    // 1. Calculate local axes
    final xAxis = (rightEar - leftEar).normalized();
    final chin = landmarks[152];
    final forehead = landmarks[10];
    final yAxis = (forehead - chin).normalized(); // Upwards
    
    // Ensure orthogonal Z axis
    final zAxis = xAxis.cross(yAxis).normalized();
    
    // Re-orthogonalize Y axis to ensure a pure rotation matrix
    final orthogonalYAxis = zAxis.cross(xAxis).normalized();

    // 2. Build Matrix4 (Translation = nosebridge, Rotation = calculated axes)
    final transform = Matrix4.identity();
    transform.setColumn(0, Vector4(xAxis.x, xAxis.y, xAxis.z, 0.0));
    transform.setColumn(1, Vector4(orthogonalYAxis.x, orthogonalYAxis.y, orthogonalYAxis.z, 0.0));
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
    _faceMeshDetector.close();
    _faceAnchorStreamController.close();
  }
}
