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
      nosebridge: Vector3(180.0, 320.0, -10.0), // Center of typical screen/camera
      leftEar: Vector3(80.0, 320.0, -5.0),
      rightEar: Vector3(280.0, 320.0, -5.0),
      faceWidth: 200.0,
      isTracking: true,
    );
  }
}
