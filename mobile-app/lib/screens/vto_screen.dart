import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';

class VirtualTryOnScreen extends StatefulWidget {
  const VirtualTryOnScreen({super.key});

  @override
  _VirtualTryOnScreenState createState() => _VirtualTryOnScreenState();
}

class _VirtualTryOnScreenState extends State<VirtualTryOnScreen> {
  late InAppWebViewController _webViewController;
  bool _permissionGranted = false;

  @override
  void initState() {
    super.initState();
    _requestCameraPermission();
  }

  Future<void> _requestCameraPermission() async {
    final cameraStatus = await Permission.camera.status;
    PermissionStatus finalCameraStatus = cameraStatus;

    if (!cameraStatus.isGranted) {
      finalCameraStatus = await Permission.camera.request();
    }

    setState(() {
      _permissionGranted = finalCameraStatus.isGranted;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_permissionGranted) {
      return Scaffold(
        appBar: AppBar(title: const Text("Virtual Try-On")),
        body: const Center(
          child:
              Text("Camera permission is required to use this feature."),
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
      body: InAppWebView(
        initialUrlRequest: URLRequest(
          url: WebUri('https://next-webar-tryon.vercel.app/'),
        ),
        initialSettings: InAppWebViewSettings(
          javaScriptEnabled: true,
          mediaPlaybackRequiresUserGesture: false,
          useHybridComposition: true,
          domStorageEnabled: true,
          allowContentAccess: true,
          allowsInlineMediaPlayback: true,
        ),
        onWebViewCreated: (controller) {
          _webViewController = controller;
        },
        onPermissionRequest: (controller, permissionRequest) async {
          // Only grant camera-related resources (deny mic if requested)
          final allowed = permissionRequest.resources.where(
            (r) => r == PermissionResourceType.CAMERA,
          );
          return PermissionResponse(
            resources: allowed.toList(),
            action: allowed.isNotEmpty
                ? PermissionResponseAction.GRANT
                : PermissionResponseAction.DENY,
          );
        },
        shouldOverrideUrlLoading: (controller, navigationAction) async {
          return NavigationActionPolicy.ALLOW;
        },
        onLoadStart: (controller, url) {
          debugPrint('Loading $url');
        },
        onLoadStop: (controller, url) {
          debugPrint('Finished loading $url');
        },
      ),
    );
  }
}
