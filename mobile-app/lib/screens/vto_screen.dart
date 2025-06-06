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
    final status = await Permission.camera.status;
    if (!status.isGranted) {
      final result = await Permission.camera.request();
      setState(() {
        _permissionGranted = result.isGranted;
      });
    } else {
      setState(() {
        _permissionGranted = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_permissionGranted) {
      return Scaffold(
        appBar: AppBar(title: const Text("Virtual Try-On")),
        body: const Center(
          child: Text("Camera permission is required to use this feature."),
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
          return PermissionResponse(
            resources: permissionRequest.resources,
            action: PermissionResponseAction.GRANT,
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
