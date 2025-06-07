import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/screens/survey_screen.dart';
import 'package:baobab_vision_project/widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:delayed_display/delayed_display.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_mesh_detection/google_mlkit_face_mesh_detection.dart';
import 'dart:io';
import 'dart:math' as math;
import 'package:flutter/services.dart';

// Define the face outline landmark indices
const List<int> _faceOutlineIndices = [
  10,
  338,
  297,
  332,
  284,
  251,
  389,
  356,
  454,
  323,
  361,
  288,
  397,
  365,
  379,
  378,
  400,
  377,
  152,
  148,
  176,
  149,
  150,
  136,
  172,
  58,
  132,
  93,
  234,
  127,
  162,
  21,
  54,
  103,
  67,
  109
];

class RecommenderScreen extends StatefulWidget {
  const RecommenderScreen({super.key});

  @override
  State<RecommenderScreen> createState() => _RecommenderScreenState();
}

class _RecommenderScreenState extends State<RecommenderScreen> {
  String? detectedFaceShape;
  CameraController? _cameraController;
  List<CameraDescription>? cameras;
  CameraDescription? _currentCameraDescription;

  FaceMeshDetector? _faceMeshDetector;

  bool isDetecting = false;
  bool isCameraInitialized = false;
  bool hasDetectedFace = false;
  int detectionCount = 0;
  Map<String, int> shapeVotes = {};
  bool isStreamActive = false;

  String? currentFaceShape;
  double confidenceLevel = 0.0;
  final int minDetectionsForFinalDecision = 7;
  final double minConfidenceForFinalDecision = 0.70;
  final int maxDetectionHistory = 20;
  int consecutiveNonClearFrames = 0;
  final int maxConsecutiveNonClearFrames = 5;

  String debugInfo = "Initializing...";
  int frameFaceCount = 0;

  // For FaceMeshPainter
  FaceMesh? _activeFaceMesh;
  InputImageMetadata? _inputImageMetadataForPainter;
  Size? _previewContainerSize; // Actual size of the preview widget on screen
  final List<String> faceShapes = [
    "Oval",
    "Rectangle",
    "Round",
    "Square",
    "Heart",
    "Diamond",
    "Triangle"
  ];

  @override
  void initState() {
    super.initState();
    initializeCamera(shouldStartStream: true);
    initializeFaceMeshDetector();
  }

  void initializeFaceMeshDetector() {
    _faceMeshDetector = FaceMeshDetector(
      option: FaceMeshDetectorOptions.faceMesh,
    );
  }

  Future<void> initializeCamera(
      {CameraDescription? cameraToUse, bool shouldStartStream = false}) async {
    try {
      if (!mounted) return;
      setState(() {
        debugInfo = "Initializing camera...";
        isCameraInitialized = false;
        _activeFaceMesh = null; // Reset mesh on camera init
        _inputImageMetadataForPainter = null;
      });

      if (_cameraController != null) {
        if (_cameraController!.value.isStreamingImages) {
          await _cameraController!.stopImageStream();
        }
        await _cameraController!.dispose();
        _cameraController = null;
      }

      if (mounted) {
        setState(() {
          shapeVotes.clear();
          detectionCount = 0;
          detectedFaceShape = null;
          currentFaceShape = null;
          confidenceLevel = 0.0;
          hasDetectedFace = false;
          frameFaceCount = 0;
          consecutiveNonClearFrames = 0;
        });
      }

      cameras ??= await availableCameras();

      if (cameras == null || cameras!.isEmpty) {
        if (!mounted) return;
        setState(() {
          debugInfo = "No cameras available. Check permissions.";
          isCameraInitialized = false;
          _currentCameraDescription = null;
        });
        return;
      }

      if (cameraToUse != null) {
        _currentCameraDescription = cameraToUse;
      } else {
        _currentCameraDescription ??= cameras!.firstWhere(
            (camera) => camera.lensDirection == CameraLensDirection.front,
            orElse: () {
          return cameras![0];
        });
      }

      if (!mounted) return;
      setState(() {
        debugInfo =
            "Using ${_currentCameraDescription!.lensDirection == CameraLensDirection.front ? 'front' : 'back'} camera...";
      });

      _cameraController = CameraController(
        _currentCameraDescription!,
        ResolutionPreset.high,
        enableAudio: false,
        imageFormatGroup: Platform.isAndroid
            ? ImageFormatGroup.nv21
            : ImageFormatGroup.bgra8888,
      );

      await _cameraController!.initialize();
      if (_cameraController!.value.isInitialized) {
        print('Camera Initialized - Name: ${_currentCameraDescription!.name}, '
            'Lens: ${_currentCameraDescription!.lensDirection}, '
            'Sensor Orientation: ${_currentCameraDescription!.sensorOrientation}, '
            'PreviewSize: ${_cameraController!.value.previewSize}, '
            'AspectRatio: ${_cameraController!.value.aspectRatio}');
      }

      if (!mounted) return;
      setState(() {
        isCameraInitialized = true;
        debugInfo = "Camera ready.";
      });

      if (shouldStartStream) {
        await Future.delayed(const Duration(milliseconds: 400));
        if (mounted && isCameraInitialized) {
          startRealTimeDetection();
        }
      }
    } catch (e, stackTrace) {
      print("Error initializing camera: $e\n$stackTrace");
      if (!mounted) return;
      setState(() {
        isCameraInitialized = false;
        debugInfo = "Camera init error. Please retry.";
      });
    }
  }

  Future<void> _flipCamera() async {
    if (cameras == null ||
        cameras!.length < 2 ||
        _currentCameraDescription == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("No other camera to switch to.")),
        );
      }
      return;
    }

    bool wasStreamActive = isStreamActive;
    if (isStreamActive) {
      stopRealTimeDetection();
    }
    _activeFaceMesh = null;
    _inputImageMetadataForPainter = null;

    if (mounted) {
      setState(() {
        isCameraInitialized = false;
        debugInfo = "Flipping camera...";
        detectedFaceShape = null;
        currentFaceShape = null;
        shapeVotes.clear();
        detectionCount = 0;
        consecutiveNonClearFrames = 0;
      });
    }
    await Future.delayed(const Duration(milliseconds: 100));

    CameraDescription newCameraDesc;
    int currentIndex = cameras!.indexOf(_currentCameraDescription!);
    if (currentIndex != -1) {
      newCameraDesc = cameras![(currentIndex + 1) % cameras!.length];
    } else {
      newCameraDesc = cameras!.firstWhere(
          (c) => c.lensDirection != _currentCameraDescription?.lensDirection,
          orElse: () => cameras!.firstWhere(
              (c) => c != _currentCameraDescription,
              orElse: () => cameras!.first));
    }
    await initializeCamera(
        cameraToUse: newCameraDesc, shouldStartStream: wasStreamActive);
  }

  void startRealTimeDetection() {
    if (_cameraController == null ||
        !_cameraController!.value.isInitialized ||
        !isCameraInitialized) {
      if (mounted) {
        setState(() => debugInfo = 'Camera not ready. Wait or reset.');
      }
      return;
    }
    if (isStreamActive) return;

    if (!mounted) return;
    setState(() {
      isStreamActive = true;
      shapeVotes.clear();
      detectionCount = 0;
      currentFaceShape = null;
      confidenceLevel = 0.0;
      consecutiveNonClearFrames = 0;
      debugInfo = "Detection active - Looking for faces...";
      hasDetectedFace = false;
      frameFaceCount = 0;
      _activeFaceMesh = null;
      _inputImageMetadataForPainter = null;
    });

    try {
      _cameraController!.startImageStream((CameraImage image) {
        if (!isDetecting && isStreamActive && mounted) {
          detectFaceMeshRealTime(image);
        }
      });
    } catch (e, stackTrace) {
      print("Error starting image stream: $e\n$stackTrace");
      if (!mounted) return;
      setState(() {
        isStreamActive = false;
        debugInfo = "Image stream error.";
      });
    }
  }

  void stopRealTimeDetection() {
    if (!isStreamActive &&
        (_cameraController == null ||
            !_cameraController!.value.isStreamingImages)) {
      return;
    }
    bool shouldUpdateDebug = detectedFaceShape == null;

    if (mounted) {
      setState(() {
        isStreamActive = false;
        if (shouldUpdateDebug) {
          debugInfo = "Detection stopped.";
        }
      });
    } else {
      isStreamActive = false;
    }

    if (_cameraController != null &&
        _cameraController!.value.isStreamingImages) {
      _cameraController!
          .stopImageStream()
          .then((_) {})
          .catchError((e, stackTrace) {
        print("Error stopping image stream: $e\n$stackTrace");
      });
    }
  }

  InputImage? _convertCameraImageToInputImage(CameraImage cameraImage) {
    if (_cameraController == null ||
        !isCameraInitialized ||
        _currentCameraDescription == null) {
      return null;
    }

    final camera = _currentCameraDescription!;
    final sensorOrientation = camera.sensorOrientation;
    InputImageRotation rotation;

    if (Platform.isIOS) {
      rotation = InputImageRotationValue.fromRawValue(sensorOrientation) ??
          InputImageRotation.rotation0deg;
    } else if (Platform.isAndroid) {
      rotation = InputImageRotationValue.fromRawValue(sensorOrientation) ??
          InputImageRotation.rotation0deg;
    } else {
      rotation = InputImageRotation.rotation0deg;
    }

    final format = InputImageFormatValue.fromRawValue(cameraImage.format.raw) ??
        (Platform.isAndroid
            ? InputImageFormat.nv21
            : InputImageFormat.bgra8888);

    if (cameraImage.planes.isEmpty) return null;

    final WriteBuffer allBytes = WriteBuffer();
    for (final Plane plane in cameraImage.planes) {
      allBytes.putUint8List(plane.bytes);
    }
    final bytes = allBytes.done().buffer.asUint8List();

    if (bytes.isEmpty) return null;

    final inputImageData = InputImageMetadata(
      size: Size(cameraImage.width.toDouble(), cameraImage.height.toDouble()),
      rotation: rotation,
      format: format,
      bytesPerRow: cameraImage.planes[0].bytesPerRow,
    );

    try {
      return InputImage.fromBytes(bytes: bytes, metadata: inputImageData);
    } catch (e, s) {
      print("InputImage conversion error: $e\n$s");
      if (mounted) setState(() => debugInfo = "Image conversion error.");
      return null;
    }
  }

  double _calculate3DDistance(FaceMeshPoint p1, FaceMeshPoint p2) {
    final double dx = p1.x - p2.x;
    final double dy = p1.y - p2.y;
    final double dz = p1.z - p2.z;
    return math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  bool _isFaceMeshClearlyDetected(FaceMesh mesh) {
    if (mesh.points.length < 468) return false;
    return true;
  }

  Future<void> detectFaceMeshRealTime(CameraImage cameraImage) async {
    if (_faceMeshDetector == null ||
        isDetecting ||
        !isStreamActive ||
        !mounted) {
      return;
    }

    if (mounted) setState(() => isDetecting = true);

    final InputImage? inputImage = _convertCameraImageToInputImage(cameraImage);

    if (inputImage == null) {
      if (mounted) setState(() => isDetecting = false);
      return;
    }

    try {
      final List<FaceMesh> faceMeshes =
          await _faceMeshDetector!.processImage(inputImage);

      if (!mounted) {
        isDetecting = false;
        return;
      }

      String newDebugInfoForFrame = debugInfo;

      if (mounted) {
        setState(() {
          frameFaceCount = faceMeshes.length;
          hasDetectedFace = faceMeshes.isNotEmpty;
          if (faceMeshes.isNotEmpty) {
            _activeFaceMesh = faceMeshes.first;
            _inputImageMetadataForPainter = inputImage.metadata;
          } else {
            _activeFaceMesh = null;
            _inputImageMetadataForPainter = null;
          }
        });
      }

      if (faceMeshes.isNotEmpty) {
        FaceMesh mainFaceMesh = faceMeshes.first;

        if (!_isFaceMeshClearlyDetected(mainFaceMesh)) {
          consecutiveNonClearFrames++;
          newDebugInfoForFrame = "Face mesh unclear. Adjust position/lighting.";
          if (mounted) {
            setState(() {
              _activeFaceMesh = null;
              _inputImageMetadataForPainter = null;
            });
          }
          if (mounted &&
              (consecutiveNonClearFrames > 2 ||
                  !debugInfo.startsWith("Face mesh unclear"))) {
            setState(() {
              debugInfo = newDebugInfoForFrame;
              if (consecutiveNonClearFrames > maxConsecutiveNonClearFrames &&
                  currentFaceShape != null) {
                currentFaceShape = null;
                confidenceLevel = 0.0;
                shapeVotes.clear();
                detectionCount = 0;
              }
            });
          }
          isDetecting = false;
          return;
        } else {
          if (consecutiveNonClearFrames > 0 &&
              mounted &&
              debugInfo.startsWith("Face mesh unclear")) {
            newDebugInfoForFrame = "Analyzing with 3D Mesh...";
          }
          consecutiveNonClearFrames = 0;
        }

        String? classifiedShapeAttempt = classifyFaceShape3D(mainFaceMesh);

        if (detectedFaceShape == null) {
          if (classifiedShapeAttempt != null) {
            shapeVotes[classifiedShapeAttempt] =
                (shapeVotes[classifiedShapeAttempt] ?? 0) + 1;
            detectionCount++;
          } else {
            newDebugInfoForFrame =
                "3D Shape unclear, try different angle/lighting.";
            if (shapeVotes.isEmpty &&
                detectionCount > maxDetectionHistory / 2) {
              if (mounted)
                setState(() {
                  currentFaceShape = null;
                  confidenceLevel = 0.0;
                });
            }
          }

          if (shapeVotes.isNotEmpty) {
            final topVoteEntry =
                shapeVotes.entries.reduce((a, b) => a.value > b.value ? a : b);
            int totalValidVotes =
                shapeVotes.values.fold(0, (sum, item) => sum + item);
            double confidence = (totalValidVotes > 0)
                ? (topVoteEntry.value /
                    math.min(totalValidVotes, maxDetectionHistory))
                : 0.0;
            confidence = math.min(confidence, 1.0);

            if (mounted) {
              currentFaceShape = topVoteEntry.key;
              confidenceLevel = confidence;
              newDebugInfoForFrame =
                  "3D Analyzing: ${currentFaceShape ?? "Unknown"} (${(confidenceLevel * 100).toStringAsFixed(0)}%)";
            }

            if (topVoteEntry.value >= minDetectionsForFinalDecision &&
                confidenceLevel >= minConfidenceForFinalDecision) {
              if (mounted) {
                setState(() {
                  detectedFaceShape = topVoteEntry.key;
                  newDebugInfoForFrame =
                      "3D CONFIRMED: $detectedFaceShape! (${(confidenceLevel * 100).toStringAsFixed(0)}%)";
                  debugInfo = newDebugInfoForFrame;
                });
              }
              stopRealTimeDetection();
            }
          } else if (classifiedShapeAttempt == null && detectionCount == 0) {
            if (mounted) {
              currentFaceShape = null;
              confidenceLevel = 0.0;
              newDebugInfoForFrame = "3D Shape unclear, adjust position.";
            }
          }
        }
        if (mounted &&
            newDebugInfoForFrame != debugInfo &&
            (detectedFaceShape == null ||
                newDebugInfoForFrame.startsWith("3D CONFIRMED"))) {
          setState(() => debugInfo = newDebugInfoForFrame);
        }
      } else {
        consecutiveNonClearFrames = 0;
        if (mounted && detectedFaceShape == null) {
          newDebugInfoForFrame = (shapeVotes.isEmpty && detectionCount == 0)
              ? "No faces detected. Position face in frame. ($frameFaceCount)"
              : "Searching for face... ($frameFaceCount)";

          if (currentFaceShape != null && frameFaceCount == 0) {
            if (mounted)
              setState(() {
                currentFaceShape = null;
                confidenceLevel = 0.0;
              });
          }
          if (mounted && newDebugInfoForFrame != debugInfo)
            setState(() => debugInfo = newDebugInfoForFrame);
        }
      }
    } catch (e, stackTrace) {
      print("Error processing face mesh: $e\n$stackTrace");
      if (mounted) setState(() => debugInfo = "3D Detection Error.");
    } finally {
      if (mounted) setState(() => isDetecting = false);
    }
  }

  String? classifyFaceShape3D(FaceMesh faceMesh) {
    final List<FaceMeshPoint> points = faceMesh.points;
    if (points.length < 468) return null;

    const int chinTipIdx = 152;
    const int foreheadCenterTopIdx = 10;
    const int leftCheekOuterIdx = 234;
    const int rightCheekOuterIdx = 454;
    const int leftJawAngleIdx = 172;
    const int rightJawAngleIdx = 397;
    const int leftTempleIdx = 70;
    const int rightTempleIdx = 300;

    try {
      bool checkPoint(FaceMeshPoint p) =>
          (p.x.abs() > 1e-3 || p.y.abs() > 1e-3);
      if (![
        chinTipIdx,
        foreheadCenterTopIdx,
        leftCheekOuterIdx,
        rightCheekOuterIdx,
        leftJawAngleIdx,
        rightJawAngleIdx,
        leftTempleIdx,
        rightTempleIdx
      ].every((idx) => idx < points.length && checkPoint(points[idx]))) {
        return null;
      }

      double faceHeight = _calculate3DDistance(
          points[foreheadCenterTopIdx], points[chinTipIdx]);
      double cheekboneWidth = _calculate3DDistance(
          points[leftCheekOuterIdx], points[rightCheekOuterIdx]);
      double jawWidth = _calculate3DDistance(
          points[leftJawAngleIdx], points[rightJawAngleIdx]);
      double foreheadWidth =
          _calculate3DDistance(points[leftTempleIdx], points[rightTempleIdx]);

      if (faceHeight < 1e-3 ||
          cheekboneWidth < 1e-3 ||
          jawWidth < 1e-3 ||
          foreheadWidth < 1e-3) {
        return null;
      }

      double overallFaceWidth = cheekboneWidth;
      if (overallFaceWidth < 1e-3) {
        overallFaceWidth = foreheadWidth > 1e-3
            ? foreheadWidth
            : (jawWidth > 1e-3 ? jawWidth : faceHeight * 0.75);
      }
      if (overallFaceWidth < 1e-3) return null;
      double HWRatio = faceHeight / overallFaceWidth;
      double FWRatioToOverall = foreheadWidth / overallFaceWidth;
      double JWRatioToOverall = jawWidth / overallFaceWidth;

      if (HWRatio >= 1.60) {
        bool widthsSomewhatUniform =
            (foreheadWidth - jawWidth).abs() < overallFaceWidth * 0.25 &&
                FWRatioToOverall > 0.75 &&
                JWRatioToOverall > 0.70;
        if (widthsSomewhatUniform) {
          return "Rectangle";
        }
      }

      if (HWRatio >= 0.88 && HWRatio <= 1.25) {
        double widthTolerance = 0.18;
        bool fw_eq_cw = (foreheadWidth - cheekboneWidth).abs() <
            cheekboneWidth * widthTolerance;
        bool jw_eq_cw =
            (jawWidth - cheekboneWidth).abs() < cheekboneWidth * widthTolerance;
        bool fw_eq_jw =
            (foreheadWidth - jawWidth).abs() < foreheadWidth * widthTolerance;
        if (fw_eq_cw && jw_eq_cw && fw_eq_jw) {
          return "Square";
        }
      }

      if (jawWidth > foreheadWidth * 1.15 &&
          jawWidth > cheekboneWidth * 1.05 &&
          foreheadWidth < cheekboneWidth) {
        if (HWRatio < 1.65) {
          return "Triangle";
        }
      } // 4. Heart: Forehead is broad (often widest part or comparable to cheeks), jaw is significantly narrower.
      if (HWRatio > 1.0 && HWRatio < 1.65) {
        bool foreheadProminent = foreheadWidth >= cheekboneWidth * 0.93;
        // OR if cheeks are widest, forehead is still substantial
        bool cheeksWidestButForeheadBroad =
            cheekboneWidth > foreheadWidth && foreheadWidth >= jawWidth * 1.18;

        bool jawVeryNarrow =
            jawWidth < foreheadWidth * 0.78 && jawWidth < cheekboneWidth * 0.78;

        if ((foreheadProminent || cheeksWidestButForeheadBroad) &&
            jawVeryNarrow) {
          // Check it's not a Diamond (Diamond has narrow forehead relative to very wide cheeks)
          bool notDiamond = !(cheekboneWidth > foreheadWidth * 1.20 &&
              foreheadWidth < cheekboneWidth * 0.85);
          if (notDiamond) {
            return "Heart";
          }
        }
      } // 5. Diamond: Cheekbones are EXTREMELY the widest. Forehead and jawline are both significantly narrower and symmetrical.
      if (HWRatio > 1.10 && HWRatio < 1.65) {
        bool cheeksVeryDominant = cheekboneWidth > foreheadWidth * 1.18 &&
            cheekboneWidth > jawWidth * 1.18;
        bool foreheadNarrow = foreheadWidth < cheekboneWidth * 0.88;
        bool jawNarrow = jawWidth < cheekboneWidth * 0.88;
        bool foreheadJawSymmetrical =
            (foreheadWidth - jawWidth).abs() < foreheadWidth * 0.25;

        if (cheeksVeryDominant &&
            foreheadNarrow &&
            jawNarrow &&
            foreheadJawSymmetrical) {
          return "Diamond";
        }
      } // 6. Round: Face height and width are nearly equal. Soft, curved outline. Cheeks often widest or equal.
      if (HWRatio >= 0.88 && HWRatio <= 1.25) {
        bool cheeksFull = cheekboneWidth >= foreheadWidth * 0.88 &&
            cheekboneWidth >= jawWidth * 0.88;
        bool jawNotOverlyWideOrNarrow =
            jawWidth > foreheadWidth * 0.80 && jawWidth < foreheadWidth * 1.10;
        bool foreheadNotPinched = FWRatioToOverall > 0.75;
        bool jawNotPinched = JWRatioToOverall > 0.70;

        if (cheeksFull &&
            jawNotOverlyWideOrNarrow &&
            foreheadNotPinched &&
            jawNotPinched) {
          bool isSquare = ((foreheadWidth - cheekboneWidth).abs() <
                  cheekboneWidth * 0.18 && // Using Square's tolerance
              (jawWidth - cheekboneWidth).abs() < cheekboneWidth * 0.18 &&
              (foreheadWidth - jawWidth).abs() < foreheadWidth * 0.18);
          if (!isSquare) {
            return "Round";
          }
        }
      } // 7. Oval: Distinctly longer than wide (but not Rectangle), gentle tapering from cheekbones.
      if (HWRatio > 1.25 && HWRatio < 1.65) {
        bool cheeksGenerallyWidest = cheekboneWidth >= foreheadWidth * 0.95 &&
            cheekboneWidth >= jawWidth * 0.95;
        bool gentleTaper = FWRatioToOverall < 0.97 && JWRatioToOverall < 0.93;
        bool balancedEnds =
            (foreheadWidth - jawWidth).abs() < cheekboneWidth * 0.30;

        if (cheeksGenerallyWidest && gentleTaper && balancedEnds) {
          bool isLikelyDiamond = cheekboneWidth > foreheadWidth * 1.18 &&
              cheekboneWidth > jawWidth * 1.18 &&
              foreheadWidth < cheekboneWidth * 0.88 &&
              jawWidth < cheekboneWidth * 0.88;
          bool isLikelyHeart = (foreheadWidth >= cheekboneWidth * 0.93 ||
                  (cheekboneWidth > foreheadWidth &&
                      foreheadWidth >= jawWidth * 1.18)) &&
              (jawWidth < foreheadWidth * 0.78 &&
                  jawWidth < cheekboneWidth * 0.78);
          if (!isLikelyDiamond && !isLikelyHeart) {
            return "Oval";
          }
        }
      }

      // If still no match, a very soft fallback for common shapes if proportions are roughly in their zone.
      // This is risky and can cause bias, but "null" too often is also not ideal.
      if (HWRatio >= 0.85 && HWRatio <= 1.30) {
        // Broader range for "balanced"
        // If widths are generally in the same ballpark
        if ((FWRatioToOverall > 0.7 &&
            JWRatioToOverall > 0.65 &&
            (foreheadWidth - jawWidth).abs() < overallFaceWidth * 0.35)) {
          return "Round"; // Default to Round for balanced but unclassified.
        }
      }
      if (HWRatio > 1.30 && HWRatio < 1.65) {
        // Broader range for "longer"
        // If it tapers somewhat
        if (FWRatioToOverall < 0.98 && JWRatioToOverall < 0.95) {
          return "Oval";
        }
      }

      return null;
    } catch (e, s) {
      print("Error in classifyFaceShape3D: $e\n$s");
      return null;
    }
  }

  void resetDetection() {
    if (isStreamActive) {
      stopRealTimeDetection();
    }

    if (mounted) {
      setState(() {
        detectedFaceShape = null;
        currentFaceShape = null;
        confidenceLevel = 0.0;
        hasDetectedFace = false;
        frameFaceCount = 0;
        shapeVotes.clear();
        detectionCount = 0;
        debugInfo = "Retrying camera initialization...";
        isCameraInitialized = false;
        consecutiveNonClearFrames = 0;
        _activeFaceMesh = null;
        _inputImageMetadataForPainter = null;
      });
    }
    initializeCamera(
        cameraToUse: _currentCameraDescription, shouldStartStream: true);
  }

  Future<void> _showManualFaceShapeSelectionDialog() async {
    if (isStreamActive) {
      stopRealTimeDetection();
    }

    String? selectedShape = await showDialog<String>(
      context: context,
      builder: (BuildContext context) {
        return SimpleDialog(
          title: const Text('Select Your Face Shape'),
          children: faceShapes.map((shape) {
            return SimpleDialogOption(
              onPressed: () {
                Navigator.pop(context, shape);
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: Text(shape, style: TextStyle(fontSize: 16.sp)),
              ),
            );
          }).toList(),
        );
      },
    );

    if (selectedShape != null && mounted) {
      setState(() {
        detectedFaceShape = selectedShape;
        currentFaceShape = selectedShape;
        confidenceLevel = 1.0;
        debugInfo = "Manually Selected: $selectedShape";
        hasDetectedFace = true;
        _activeFaceMesh = null;
        _inputImageMetadataForPainter = null;
      });
    } else {
      if (!isStreamActive && isCameraInitialized && detectedFaceShape == null) {
        startRealTimeDetection();
      }
    }
  }

  @override
  void dispose() {
    stopRealTimeDetection();
    _cameraController?.dispose().then((_) {
      _cameraController = null;
      print("CameraController disposed");
    }).catchError((e, stackTrace) {
      print("Error disposing CameraController: $e\n$stackTrace");
    });
    _faceMeshDetector?.close().then((_) {
      _faceMeshDetector = null;
      print("FaceMeshDetector closed");
    }).catchError((e, stackTrace) {
      print("Error closing FaceMeshDetector: $e\n$stackTrace");
    });
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        title: const Text('Eyewear Recommender'),
        backgroundColor: WHITE_COLOR,
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.grey[800]),
        titleTextStyle: TextStyle(
            color: Colors.grey[800], fontSize: 18, fontWeight: FontWeight.w600),
        actions: [
          if (cameras != null && cameras!.length > 1 && isCameraInitialized)
            IconButton(
              icon: const Icon(Icons.flip_camera_ios_outlined),
              tooltip: "Flip Camera",
              onPressed: _flipCamera,
            ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                height: ScreenUtil().orientation == Orientation.portrait
                    ? ScreenUtil().screenHeight * 0.50
                    : ScreenUtil().screenWidth * 0.50,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.12),
                      blurRadius: 12,
                      spreadRadius: 1,
                      offset: const Offset(0, 5),
                    )
                  ],
                ),
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: (isCameraInitialized &&
                              _cameraController != null &&
                              _cameraController!.value.isInitialized)
                          ? LayoutBuilder(builder: (context, constraints) {
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                if (mounted &&
                                    (_previewContainerSize == null ||
                                        _previewContainerSize !=
                                            Size(constraints.maxWidth,
                                                constraints.maxHeight))) {
                                  setState(() {
                                    _previewContainerSize = Size(
                                        constraints.maxWidth,
                                        constraints.maxHeight);
                                  });
                                } else if (_previewContainerSize == null &&
                                    mounted) {
                                  _previewContainerSize = Size(
                                      constraints.maxWidth,
                                      constraints.maxHeight);
                                }
                              });

                              return SizedBox.expand(
                                child: FittedBox(
                                  fit: BoxFit.cover,
                                  child: SizedBox(
                                    width: _cameraController!
                                        .value.previewSize!.height,
                                    height: _cameraController!
                                        .value.previewSize!.width,
                                    child: CameraPreview(_cameraController!),
                                  ),
                                ),
                              );
                            })
                          : Container(
                              width: double.infinity,
                              height: double.infinity,
                              child: (!isCameraInitialized &&
                                      (debugInfo
                                              .toLowerCase()
                                              .contains("error") ||
                                          debugInfo
                                              .toLowerCase()
                                              .contains("no camera")))
                                  ? Center(
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Padding(
                                            padding: const EdgeInsets.symmetric(
                                                horizontal: 20.0),
                                            child: Text(
                                              debugInfo.contains("No cameras")
                                                  ? "No Camera Found. Check permissions."
                                                  : "Camera Error. Please try again.",
                                              style: TextStyle(
                                                  color: Colors.white,
                                                  backgroundColor:
                                                      Colors.black54,
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w500),
                                              textAlign: TextAlign.center,
                                            ),
                                          ),
                                          SizedBox(height: 15),
                                          ElevatedButton.icon(
                                            icon: Icon(Icons.refresh,
                                                color: Colors.white),
                                            label: Text("Retry Camera",
                                                style: TextStyle(
                                                    color: Colors.white)),
                                            onPressed: resetDetection,
                                            style: ElevatedButton.styleFrom(
                                                backgroundColor: Colors
                                                    .orangeAccent[700]
                                                    ?.withOpacity(0.9),
                                                padding: EdgeInsets.symmetric(
                                                    horizontal: 20,
                                                    vertical: 12)),
                                          ),
                                        ],
                                      ),
                                    )
                                  : Center(
                                      child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          CircularProgressIndicator(
                                              color: Colors.white),
                                          SizedBox(height: 10),
                                          Text(
                                            debugInfo
                                                    .toLowerCase()
                                                    .contains("initializing")
                                                ? "Initializing Camera..."
                                                : "Waiting for Camera...",
                                            style: TextStyle(
                                                color: Colors.white70,
                                                fontSize: 12),
                                          ),
                                        ],
                                      ),
                                    ),
                            ),
                    ),
                    if (isCameraInitialized &&
                        _cameraController != null &&
                        _cameraController!.value.isInitialized &&
                        _activeFaceMesh != null &&
                        _inputImageMetadataForPainter != null &&
                        _previewContainerSize != null &&
                        _currentCameraDescription != null)
                      Positioned.fill(
                        child: CustomPaint(
                          painter: FaceMeshPainter(
                            faceMesh: _activeFaceMesh!,
                            inputImageMetadata: _inputImageMetadataForPainter!,
                            cameraPreviewSize:
                                _cameraController!.value.previewSize!,
                            containerSize: _previewContainerSize!,
                            lensDirection:
                                _currentCameraDescription!.lensDirection,
                          ),
                        ),
                      ),
                    if (isCameraInitialized)
                      Center(
                        child: Container(
                          width: ScreenUtil().setWidth(200),
                          height: ScreenUtil().setHeight(280),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: detectedFaceShape != null
                                  ? Colors.greenAccent.withOpacity(0.7)
                                  : (currentFaceShape != null ||
                                          hasDetectedFace)
                                      ? Colors.amber.withOpacity(0.7)
                                      : Colors.white.withOpacity(0.4),
                              width: detectedFaceShape != null ? 3.0 : 2.0,
                            ),
                            borderRadius: BorderRadius.circular(
                                ScreenUtil().setWidth(150)),
                          ),
                        ),
                      ),
                    if (isCameraInitialized &&
                        (isStreamActive ||
                            detectedFaceShape != null ||
                            debugInfo.toLowerCase().contains("unclear")))
                      Positioned(
                        top: 16,
                        left: 16,
                        right: 16,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 9),
                          decoration: BoxDecoration(
                              color: detectedFaceShape != null
                                  ? Colors.green.withOpacity(0.9)
                                  : (currentFaceShape != null ||
                                          (hasDetectedFace &&
                                              !debugInfo
                                                  .toLowerCase()
                                                  .contains("unclear")))
                                      ? Colors.orangeAccent.withOpacity(0.9)
                                      : (debugInfo
                                              .toLowerCase()
                                              .contains("unclear"))
                                          ? Colors.redAccent.withOpacity(0.85)
                                          : Colors.blueGrey.withOpacity(0.85),
                              borderRadius: BorderRadius.circular(25),
                              boxShadow: [
                                BoxShadow(
                                    color: Colors.black.withOpacity(0.2),
                                    blurRadius: 5,
                                    offset: Offset(0, 2))
                              ]),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              if (detectedFaceShape != null)
                                const Icon(Icons.check_circle,
                                    color: Colors.white, size: 18)
                              else if (debugInfo
                                  .toLowerCase()
                                  .contains("unclear"))
                                const Icon(Icons.warning_amber_rounded,
                                    color: Colors.white, size: 18)
                              else if (currentFaceShape != null)
                                const Icon(Icons.camera_alt_outlined,
                                    color: Colors.white, size: 18)
                              else if (isStreamActive && hasDetectedFace)
                                const Icon(Icons.document_scanner_outlined,
                                    color: Colors.white, size: 18)
                              else if (isStreamActive)
                                const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2.5,
                                        valueColor:
                                            AlwaysStoppedAnimation<Color>(
                                                Colors.white)))
                              else
                                const Icon(Icons.camera,
                                    color: Colors.white, size: 18),
                              const SizedBox(width: 10),
                              Flexible(
                                child: Text(
                                  detectedFaceShape != null
                                      ? 'Confirmed: $detectedFaceShape'
                                      : debugInfo
                                              .toLowerCase()
                                              .contains("unclear")
                                          ? 'Face/Mesh unclear. Adjust.'
                                          : currentFaceShape != null
                                              ? '${currentFaceShape!} (${(confidenceLevel * 100).toStringAsFixed(0)}%)'
                                              : hasDetectedFace
                                                  ? 'Analyzing 3D Mesh...'
                                                  : (isStreamActive
                                                      ? 'Point Camera at Face'
                                                      : "Camera Ready"),
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w600,
                                      letterSpacing: 0.3),
                                  textAlign: TextAlign.center,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              SizedBox(height: ScreenUtil().setHeight(25)),
              CustomText(
                text: detectedFaceShape != null
                    ? 'All set! Your face shape is ' +
                        (detectedFaceShape ?? '') +
                        '.'
                    : debugInfo.toLowerCase().contains("unclear") ||
                            (currentFaceShape == null &&
                                hasDetectedFace &&
                                isStreamActive &&
                                detectionCount < 1 &&
                                shapeVotes.isEmpty)
                        ? "Cannot determine shape clearly. Try again, ensure good lighting, and face the camera directly."
                        : currentFaceShape != null
                            ? 'Hold still, refining 3D analysis for ' +
                                (currentFaceShape ?? "your face") +
                                '...'
                            : hasDetectedFace
                                ? 'Face detected! Please hold steady for 3D analysis.'
                                : 'Position your face in the oval. Ensure good lighting and face the camera directly.',
                fontSize: ScreenUtil().setSp(14.5),
                color: detectedFaceShape != null
                    ? (Colors.green[700] ?? Colors.green)
                    : debugInfo.toLowerCase().contains("unclear") ||
                            (currentFaceShape == null &&
                                hasDetectedFace &&
                                isStreamActive &&
                                detectionCount < 1 &&
                                shapeVotes.isEmpty)
                        ? (Colors.red[700] ?? Colors.red)
                        : currentFaceShape != null || hasDetectedFace
                            ? (Colors.deepOrange[600] ?? Colors.orange)
                            : (Colors.grey[700] ?? Colors.grey),
                textAlign: TextAlign.center,
                fontWeight: detectedFaceShape != null ||
                        debugInfo.toLowerCase().contains("unclear") ||
                        (currentFaceShape == null &&
                            hasDetectedFace &&
                            isStreamActive &&
                            detectionCount < 1 &&
                            shapeVotes.isEmpty)
                    ? FontWeight.w600
                    : FontWeight.normal,
              ),
              SizedBox(height: ScreenUtil().setHeight(35)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10.0),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        if (detectedFaceShape == null && isCameraInitialized)
                          Expanded(
                            child: TextButton.icon(
                              onPressed: _showManualFaceShapeSelectionDialog,
                              icon: Icon(Icons.edit_outlined,
                                  color: Colors.blue[700], size: 20),
                              label: Text('Select My Shape',
                                  style: TextStyle(
                                      color: Colors.blue[800],
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w500)),
                              style: TextButton.styleFrom(
                                  padding: EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 10),
                                  backgroundColor: Colors.blue[50],
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10))),
                            ),
                          ),
                        if (detectedFaceShape == null && isCameraInitialized)
                          const SizedBox(width: 15),
                        if (isCameraInitialized)
                          Expanded(
                            child: TextButton.icon(
                              onPressed: resetDetection,
                              icon: Icon(Icons.refresh_rounded,
                                  color: Colors.orange[700], size: 20),
                              label: Text(
                                  detectedFaceShape != null
                                      ? 'Rescan My Face'
                                      : 'Rescan Face',
                                  style: TextStyle(
                                      color: Colors.orange[800],
                                      fontSize: 13.5,
                                      fontWeight: FontWeight.w500)),
                              style: TextButton.styleFrom(
                                  padding: EdgeInsets.symmetric(
                                      horizontal: 12, vertical: 10),
                                  backgroundColor: Colors.orange[50],
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10))),
                            ),
                          ),
                      ],
                    ),
                    SizedBox(height: ScreenUtil().setHeight(20)),
                    Center(
                      child: DelayedDisplay(
                        delay: const Duration(milliseconds: 300),
                        fadingDuration: const Duration(milliseconds: 400),
                        child: ElevatedButton.icon(
                          onPressed: (detectedFaceShape != null)
                              ? () {
                                  stopRealTimeDetection();
                                  String finalFaceShape = detectedFaceShape!;
                                  Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) => SurveyScreen(
                                            detectedFaceShape: finalFaceShape)),
                                  );
                                }
                              : null,
                          icon: const Icon(Icons.arrow_forward_ios_rounded,
                              size: 20),
                          label: Text(
                              detectedFaceShape != null
                                  ? "Continue to Survey"
                                  : (currentFaceShape != null && isStreamActive
                                      ? "Analyzing..."
                                      : "Waiting for Shape"),
                              style: TextStyle(
                                  fontSize: 16.5, fontWeight: FontWeight.w600)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: detectedFaceShape != null
                                ? Color(0xFF28a745)
                                : Colors.grey[400],
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                                horizontal: 35, vertical: 15),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            elevation: 4,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: ScreenUtil().setHeight(25)),
            ],
          ),
        ),
      ),
    );
  }
}

// Custom Painter for Face Mesh Outline
class FaceMeshPainter extends CustomPainter {
  final FaceMesh faceMesh;
  final InputImageMetadata inputImageMetadata;
  final Size cameraPreviewSize;
  final Size containerSize;
  final CameraLensDirection lensDirection;

  FaceMeshPainter({
    required this.faceMesh,
    required this.inputImageMetadata,
    required this.cameraPreviewSize,
    required this.containerSize,
    required this.lensDirection,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final Paint paint = Paint()
      ..color = Colors.cyanAccent.withOpacity(0.8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    Size previewRenderBoxSize =
        Size(cameraPreviewSize.height, cameraPreviewSize.width);

    if (previewRenderBoxSize.width <= 0 ||
        previewRenderBoxSize.height <= 0 ||
        containerSize.width <= 0 ||
        containerSize.height <= 0) return;

    final double arPreview =
        previewRenderBoxSize.width / previewRenderBoxSize.height;
    final double arContainer = containerSize.width / containerSize.height;

    double scale;
    double offsetX = 0.0;
    double offsetY = 0.0;

    if (arPreview > arContainer) {
      scale = containerSize.height / previewRenderBoxSize.height;
      offsetX = (containerSize.width - previewRenderBoxSize.width * scale) / 2;
    } else {
      scale = containerSize.width / previewRenderBoxSize.width;
      offsetY =
          (containerSize.height - previewRenderBoxSize.height * scale) / 2;
    }

    final Path path = Path();
    bool firstPoint = true;

    for (final int index in _faceOutlineIndices) {
      if (index < faceMesh.points.length) {
        final FaceMeshPoint p = faceMesh.points[index];

        double viewX = p.x * scale + offsetX;
        double viewY = p.y * scale + offsetY;

        if (lensDirection == CameraLensDirection.front) {
          viewX = containerSize.width - viewX;
        }

        if (firstPoint) {
          path.moveTo(viewX, viewY);
          firstPoint = false;
        } else {
          path.lineTo(viewX, viewY);
        }
      }
    }
    if (!firstPoint) {
      path.close();
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant FaceMeshPainter oldDelegate) {
    return oldDelegate.faceMesh != faceMesh ||
        oldDelegate.inputImageMetadata != inputImageMetadata ||
        oldDelegate.containerSize != containerSize ||
        oldDelegate.cameraPreviewSize != cameraPreviewSize ||
        oldDelegate.lensDirection != lensDirection;
  }
}