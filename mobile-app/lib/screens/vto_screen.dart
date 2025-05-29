import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:google_mlkit_commons/google_mlkit_commons.dart';

class VirtualTryOnScreen extends StatefulWidget {
  const VirtualTryOnScreen({super.key});

  @override
  _VirtualTryOnScreenState createState() => _VirtualTryOnScreenState();
}

class _VirtualTryOnScreenState extends State<VirtualTryOnScreen> {
  int selectedItemIndex = 0; // Index of selected eyewear
  late CameraController _cameraController;
  late FaceDetector _faceDetector;
  bool _isDetecting = false;
  bool _isCameraInitialized = false; // <-- Added flag for camera readiness
  List<Face> _faces = [];

  final List<String> eyewearImages = [
    'assets/images/eyewear_1.png',
    'assets/images/eyewear_2.png',
    'assets/images/eyewear_3.png',
    'assets/images/eyewear_4.png',
    'assets/images/eyewear_5.png',
    'assets/images/eyewear_6.png',
    'assets/images/eyewear_7.png',
    'assets/images/eyewear_8.png',
    'assets/images/eyewear_9.png',
  ];

  @override
  void initState() {
    super.initState();
    _initializeCamera();
    _faceDetector = FaceDetector(
      options: FaceDetectorOptions(
        enableContours: true,
        enableLandmarks: true,
      ),
    );
  }

  Future<void> _initializeCamera() async {
    final cameras = await availableCameras();
    final frontCamera = cameras.firstWhere(
      (camera) => camera.lensDirection == CameraLensDirection.front,
    );
    _cameraController = CameraController(
      frontCamera,
      ResolutionPreset.medium,
      enableAudio: false,
    );

    await _cameraController.initialize();

    setState(() {
      _isCameraInitialized = true;  // <-- Mark camera as ready here
    });

    _cameraController.startImageStream((cameraImage) {
      if (_isDetecting) return;
      _isDetecting = true;

      _processCameraImage(cameraImage).then((faces) {
        if (mounted) {
          setState(() {
            _faces = faces;
          });
        }
        _isDetecting = false;
      });
    });
  }

  Future<List<Face>> _processCameraImage(CameraImage cameraImage) async {
    // Check for supported image formats, skip if unsupported (emulator workaround)
    if (cameraImage.format.raw != 17) {
      return [];
    }

    final WriteBuffer allBytes = WriteBuffer();
    for (final Plane plane in cameraImage.planes) {
      allBytes.putUint8List(plane.bytes);
    }
    final bytes = allBytes.done().buffer.asUint8List();

    final Size imageSize = Size(
      cameraImage.width.toDouble(),
      cameraImage.height.toDouble(),
    );

    final InputImageRotation imageRotation =
        InputImageRotationValue.fromRawValue(
                _cameraController.description.sensorOrientation) ??
            InputImageRotation.rotation0deg;

    final InputImageFormat inputImageFormat = InputImageFormatValue.fromRawValue(
            cameraImage.format.raw) ??
        InputImageFormat.nv21;

    final int bytesPerRow = cameraImage.planes[0].bytesPerRow;

    final inputImageMetadata = InputImageMetadata(
      size: imageSize,
      rotation: imageRotation,
      format: inputImageFormat,
      bytesPerRow: bytesPerRow,
    );

    final inputImage = InputImage.fromBytes(
      bytes: bytes,
      metadata: inputImageMetadata,
    );

    return await _faceDetector.processImage(inputImage);
  }

  double _calculateEyewearTop() {
    if (_faces.isEmpty) return 200.h;

    final face = _faces[0];
    final nose = face.landmarks[FaceLandmarkType.noseBase];
    if (nose == null) return 200.h;

    return nose.position.y * MediaQuery.of(context).size.height /
            _cameraController.value.previewSize!.height -
        80.h;
  }

  double _calculateEyewearLeft() {
    if (_faces.isEmpty) return MediaQuery.of(context).size.width / 2 - 100.w;

    final face = _faces[0];
    final leftEye = face.landmarks[FaceLandmarkType.leftEye];
    final rightEye = face.landmarks[FaceLandmarkType.rightEye];

    if (leftEye == null || rightEye == null) {
      return MediaQuery.of(context).size.width / 2 - 100.w;
    }

    final centerX = (leftEye.position.x + rightEye.position.x) / 2;

    return centerX * MediaQuery.of(context).size.width /
            _cameraController.value.previewSize!.width -
        100.w;
  }

  @override
  void dispose() {
    _cameraController.dispose();
    _faceDetector.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!_isCameraInitialized) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text(
          'Virtual Try-On',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.black,
        centerTitle: true,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                CameraPreview(_cameraController),
                if (eyewearImages.isNotEmpty && _faces.isNotEmpty)
                  Positioned(
                    top: _calculateEyewearTop(),
                    left: _calculateEyewearLeft(),
                    child: Image.asset(
                      eyewearImages[selectedItemIndex],
                      width: 200.w,
                    ),
                  ),
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.symmetric(vertical: 10.h),
            color: Colors.black,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 15.w),
                  child: Text(
                    'Select Eyewear',
                    style: TextStyle(color: Colors.white, fontSize: 18.sp),
                  ),
                ),
                SizedBox(height: 10.h),
                SizedBox(
                  height: 100.h,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: eyewearImages.length,
                    itemBuilder: (context, index) {
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedItemIndex = index;
                          });
                        },
                        child: Container(
                          margin: EdgeInsets.symmetric(horizontal: 8.w),
                          padding: EdgeInsets.all(8.w),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: selectedItemIndex == index
                                  ? Colors.blue
                                  : Colors.transparent,
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(10),
                            color: Colors.white10,
                          ),
                          child: Image.asset(
                            eyewearImages[index],
                            width: 80.w,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
