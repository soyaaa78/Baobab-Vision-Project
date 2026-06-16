import 'dart:math' as dart_math;
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
  
  // ==========================================
  // TUNABLE OFFSETS (For Integration Day)
  // These variables will be adjusted to make the 
  // glasses sit perfectly on the real face tracker.
  // ==========================================
  double offsetX = 0.0;
  double offsetY = 0.0; 
  double offsetZ = 0.0;
  
  double pitchOffset = 0.0; // Rotation around X-axis
  double yawOffset = 0.0;   // Rotation around Y-axis
  double rollOffset = 0.0; // Roll is now correctly tracked via the proper rotation matrix in FaceTrackerService
  double scaleOffset = 0.8;

  @override
  void initState() {
    super.initState();
    _controller = Flutter3DController();
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

          double x = data.nosebridge.x * scale + fitOffsetX;
          double y = data.nosebridge.y * scale + fitOffsetY;

          // mirror horizontally for front camera
          x = size.width - x;

          // transform is anchored at the center of the screen
          // so we calculate translation relative to the screen center
          double transX = x - (size.width / 2);
          double transY = y - (size.height / 2);

          // compute roll from ear landmarks and mirror for front camera
          final earDx = data.rightEar.x - data.leftEar.x;
          final earDy = data.rightEar.y - data.leftEar.y;
          final cameraRoll = dart_math.atan2(earDy, earDx);
          final displayRoll = -cameraRoll;
          
          // build transform from scratch: position -> roll -> pitch/yaw offsets -> scale
          appliedTransform.translate(transX + offsetX, transY + offsetY, offsetZ);
          appliedTransform.rotateZ(displayRoll + rollOffset);
          appliedTransform.rotateX(pitchOffset);
          appliedTransform.rotateY(yawOffset);
        }
        
        // Apply scale
        appliedTransform.scale(scaleOffset, scaleOffset, scaleOffset);

        // We wrap the 3D Viewer in a Transform widget to apply the Matrix4 
        // coming from the AR pipeline.
        return Positioned.fill(
          child: IgnorePointer( // Don't intercept touches meant for the UI
            child: Transform(
              transform: appliedTransform,
              alignment: Alignment.center,
              child: Flutter3DViewer(
                controller: _controller,
                src: widget.glbPath,
                activeGestureInterceptor: false, // Prevent the viewer from capturing gestures
              ),
            ),
          ),
        );
      },
    );
  }
}
