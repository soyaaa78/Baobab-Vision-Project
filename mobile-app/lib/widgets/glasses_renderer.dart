import 'dart:math' as dart_math;
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_3d_controller/flutter_3d_controller.dart';
import 'package:vector_math/vector_math_64.dart' as math;
import '../models/face_anchor_data.dart';

class GlassesRenderer extends StatefulWidget {
  final String glbPath;
  final Stream<FaceAnchorData> faceDataStream;
  final Size? previewSize;
  
  const GlassesRenderer({
    Key? key,
    required this.glbPath,
    required this.faceDataStream,
    this.previewSize,
  }) : super(key: key);

  @override
  State<GlassesRenderer> createState() => _GlassesRendererState();
}

class _GlassesRendererState extends State<GlassesRenderer> {
  late Flutter3DController _controller;
  StreamSubscription<FaceAnchorData>? _subscription;
  bool _isModelLoaded = false;
  
  // ==========================================
  // TUNABLE OFFSETS
  // These variables will be adjusted to make the 
  // glasses sit perfectly on the real face tracker.
  // ==========================================
  double offsetX = 0.0;
  double offsetY = 45.0; // pushes the glasses down from the eyebrows to the nose, eyeglass model's center and face center is misaligned
  double offsetZ = 0.0;
  
  // rotation sensitivity
  double yawMultiplier = 1.2;
  double pitchMultiplier = 1.0;
  
  double rollOffset = 0.0; 
  double scaleOffset = 0.9;

  @override
  void initState() {
    super.initState();
    _controller = Flutter3DController();
    _subscription = widget.faceDataStream.listen(_onFaceData);
  }

  @override
  void didUpdateWidget(covariant GlassesRenderer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.faceDataStream != widget.faceDataStream) {
      _subscription?.cancel();
      _subscription = widget.faceDataStream.listen(_onFaceData);
    }
  }

  /// Extracts standard intrinsic X-Y-Z Euler angles from the purely physical
  /// right-handed rotation matrix provided by FaceTrackerService.
  ///
  /// Uses X-Y-Z order (not Y-X-Z) to match model-viewer's extrinsic Y->X
  /// spherical coordinate application, eliminating yaw/pitch cross-talk
  /// at diagonal angles.
  ///
  /// Returns [yaw, pitch, roll] in radians:
  ///   Yaw:   + = face turned to physical RIGHT
  ///   Pitch: + = face looking physical DOWN
  ///   Roll:  + = face tilted physical RIGHT
  List<double> _extractPhysicalEuler(Matrix4 transform) {
    final col0 = transform.getColumn(0); // Physical xAxis
    final col1 = transform.getColumn(1); // Physical yAxis
    final col2 = transform.getColumn(2); // Physical zAxis

    // Intrinsic X-Y-Z extraction
    // Gimbal lock at pitch = ±90°, acceptable for face tracking range
    final pitch = dart_math.asin(col2.y.clamp(-1.0, 1.0));   // sign flipped vs old Y-X-Z
    final yaw   = dart_math.atan2(-col2.x, col2.z);
    final roll  = dart_math.atan2(-col0.y, col1.y);


    return [-yaw, -pitch, -roll];
  }

  void _onFaceData(FaceAnchorData data) {
    if (!data.isTracking || !_isModelLoaded) return;

    final angles = _extractPhysicalEuler(data.transform);
    final yawRad = angles[0];
    final pitchRad = angles[1];

    final yawDeg = yawRad * (180.0 / dart_math.pi) * yawMultiplier;
    final pitchDeg = pitchRad * (180.0 / dart_math.pi) * pitchMultiplier;

    // Theta: horizontal orbit. 
    final thetaDeg = yawDeg;
    
    // Phi: vertical orbit. 90° = equator (straight on).
    // Nod physical down -> pitch > 0.
    // We want to see the top of the glasses, so we look from ABOVE (phi < 90).
    final phiDeg = 90.0 - pitchDeg;
    debugPrint('VTO Physical: yaw=${yawDeg.toStringAsFixed(1)}° pitch=${pitchDeg.toStringAsFixed(1)}° theta=${thetaDeg.toStringAsFixed(1)}° phi=${phiDeg.toStringAsFixed(1)}°');

    try {
      _controller.setCameraOrbit(thetaDeg, phiDeg, 105);
    } catch (e) {
    }
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<FaceAnchorData>(
      stream: widget.faceDataStream,
      initialData: FaceAnchorData.mock(),
      builder: (context, snapshot) {
        if (!snapshot.hasData || !snapshot.data!.isTracking) {
          return const SizedBox.shrink(); // Hide if no face is detected
        }
        final data = snapshot.data!;
        
        // Dynamic Scale Computation
        double baselineFaceWidth = 111.0; // Reference width in pixels
        double currentFaceWidth = data.faceWidth > 0 ? data.faceWidth : baselineFaceWidth;
        double dynamicScale = (currentFaceWidth / baselineFaceWidth) * scaleOffset;

        math.Matrix4 appliedTransform = math.Matrix4.identity();

        if (widget.previewSize != null) {
          final size = MediaQuery.of(context).size;
          final previewSize = widget.previewSize!;
          
          final double arPreview = previewSize.width / previewSize.height;
          final double arContainer = size.width / size.height;

          double scale;
          double fitOffsetX = 0.0;
          double fitOffsetY = 0.0;

          if (arPreview > arContainer) {
            scale = size.height / previewSize.height;
            fitOffsetX = (size.width - previewSize.width * scale) / 2;
          } else {
            scale = size.width / previewSize.width;
            fitOffsetY = (size.height - previewSize.height * scale) / 2;
          }

          // Position mapping using NOSE bridge point.
          double x = data.nosebridge.x * scale + fitOffsetX;
          double y = data.nosebridge.y * scale + fitOffsetY;

          // mirror horizontally for front camera
          x = size.width - x;

          // transform is anchored at the center of the screen
          // so we calculate translation relative to the screen center
          double transX = x - (size.width / 2);
          double transY = y - (size.height / 2);

          // === EXTRACT EULER ANGLES ===
          final angles = _extractPhysicalEuler(data.transform);
          final rollRad = angles[2];

          // No pivotShift hacks needed! camera-target is locked to the 3D origin (nosebridge).

          // Roll: Flutter's Z rotation is CW+. 
          // Mirrored face tilts left (CCW) when physical tilt is right (roll < 0).
          // So negative roll perfectly matches CCW. No negation needed
          final displayRoll = rollRad;
          
          // build transform: position -> rotation (Roll ONLY) -> manual offsets
          // Multiply offsetY by scale so it remains consistent at all distances
          final scaledOffsetY = offsetY * dynamicScale;
          appliedTransform.translate(transX + offsetX, transY + scaledOffsetY, offsetZ);
          appliedTransform.rotateZ(displayRoll + rollOffset);
        }
        // Apply dynamic scale
        appliedTransform.scale(dynamicScale, dynamicScale, dynamicScale);

        // We wrap the 3D Viewer in a Transform widget to apply the Matrix4 
        // coming from the AR pipeline.
        return Positioned.fill(
          child: IgnorePointer( // Don't intercept touches meant for the UI
            child: Transform(
              transform: appliedTransform,              alignment: Alignment.center,
              child: Flutter3DViewer(
                controller: _controller,
                src: widget.glbPath,
                activeGestureInterceptor: false, // Prevent the viewer from capturing gestures
                onLoad: (_) {
                  if (mounted) {
                    // Lock the camera orbit exactly on the 3D model's origin (the nosebridge)
                    // so the glasses never slide visually during rotation.
                    _controller.setCameraTarget(0, 0, 0);
                    setState(() => _isModelLoaded = true);
                  }
                },
              ),
            ),
          ),
        );
      },
    );
  }
}
