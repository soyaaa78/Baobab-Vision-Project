import 'package:vector_math/vector_math_64.dart';

class FaceAnchorData {
  final Matrix4 transform;
  final List<Vector3> landmarks;
  final Vector3 nosebridge;
  final Vector3 leftEar;
  final Vector3 rightEar;
  final double faceWidth;
  final bool isTracking;

  FaceAnchorData({
    required this.transform,
    required this.landmarks,
    required this.nosebridge,
    required this.leftEar,
    required this.rightEar,
    required this.faceWidth,
    required this.isTracking,
  });

  /// Provides mock data so Workstream 2 can build the 3D rendering pipeline
  /// without waiting for the live camera tracker.
  factory FaceAnchorData.mock() {
    return FaceAnchorData(
      transform: Matrix4.identity(),
      landmarks: [],
      nosebridge: Vector3(0.0, 0.0, -0.05),
      leftEar: Vector3(-0.07, 0.0, -0.02),
      rightEar: Vector3(0.07, 0.0, -0.02),
      faceWidth: 0.14,
      isTracking: true,
    );
  }
}
