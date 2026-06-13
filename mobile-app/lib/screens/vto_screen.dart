import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:permission_handler/permission_handler.dart';

class VirtualTryOnScreen extends StatefulWidget {
  const VirtualTryOnScreen({
    super.key,
    this.modelSlug,
    this.variantSlug,
    this.baseUrl,
  });

  final String? modelSlug;
  final String? variantSlug;
  final String? baseUrl;

  @override
  State<VirtualTryOnScreen> createState() => _VirtualTryOnScreenState();
}

class _VirtualTryOnScreenState extends State<VirtualTryOnScreen> {
  bool _permissionGranted = false;

  static const String _defaultBaseUrl = String.fromEnvironment(
    'VTO_WEB_BASE_URL',
    defaultValue: 'https://baobab-vto.netlify.app',
  );
  static const String _defaultModelSlug = 'lana';
  static const String _defaultVariantSlug = 'rich-black';

  String _slugOrDefault(String? value, String fallback) {
    final normalized = value?.trim();
    if (normalized == null || normalized.isEmpty) {
      return fallback;
    }
    return normalized.toLowerCase();
  }

  WebUri _buildVtoUri() {
    final configuredBase = (widget.baseUrl ?? _defaultBaseUrl).trim();
    final base = configuredBase.endsWith('/')
        ? configuredBase.substring(0, configuredBase.length - 1)
        : configuredBase;

    final modelSlug = _slugOrDefault(widget.modelSlug, _defaultModelSlug);
    final variantSlug = _slugOrDefault(widget.variantSlug, _defaultVariantSlug);

    return WebUri('$base/$modelSlug/$variantSlug');
  }

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
          url: _buildVtoUri(),
        ),
        initialSettings: InAppWebViewSettings(
          javaScriptEnabled: true,
          mediaPlaybackRequiresUserGesture: false,
          useHybridComposition: true,
          domStorageEnabled: true,
          allowContentAccess: true,
          allowsInlineMediaPlayback: true,
        ),
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
