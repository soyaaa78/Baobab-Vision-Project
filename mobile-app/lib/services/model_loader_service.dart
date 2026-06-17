import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path_provider/path_provider.dart';

class ModelLoaderService {
  final String _baseUrl = 'https://r2.your-domain.com/models'; // Placeholder for Integration Day
  final bool _enableNetworkFetching = false; // Set to true on Integration Day

  /// Resolves the correct path for a `.glb` file.
  /// 
  /// Downloads from the network, caches the file locally, and returns the local path.
  /// Falls back to local bundled assets if network fails or file is bundled.
  Future<String> loadModel(String productFolder, String variantName) async {
    if (!_enableNetworkFetching) {
      return _loadFromAssets(productFolder, variantName);
    }

    final fileName = '$variantName.glb';
    final dir = await getTemporaryDirectory();
    final cacheDir = Directory('${dir.path}/models_cache/$productFolder');
    
    if (!(await cacheDir.exists())) {
      await cacheDir.create(recursive: true);
    }
    
    final File localFile = File('${cacheDir.path}/$fileName');

    // 1. Check local cache
    if (await localFile.exists()) {
      // Must use file:// prefix for Flutter3DViewer to parse absolute paths correctly
      return 'file://${localFile.path}';
    }

    // 2. Try network download (Integration Day)
    try {
      final url = Uri.parse('$_baseUrl/$productFolder/$fileName');
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 5);
      final request = await client.getUrl(url);
      final response = await request.close();
      
      // Strict check to avoid downloading 404 HTML pages or domain parking pages
      if (response.statusCode == 200 && response.headers.contentType?.mimeType != 'text/html') {
        await response.pipe(localFile.openWrite());
        return 'file://${localFile.path}';
      } else {
        debugPrint('Network fetch failed or returned HTML: Status ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Network fetch failed, falling back to bundled asset: $e');
    }

    return _loadFromAssets(productFolder, variantName);
  }

  Future<String> _loadFromAssets(String productFolder, String variantName) async {
    final String assetPath = 'assets/models/$productFolder/$variantName.glb';
    try {
      await rootBundle.load(assetPath);
      return assetPath;
    } catch (e) {
      throw Exception('Failed to load model from assets: $assetPath');
    }
  }

  /// Downloads a `.glb` model directly from a full URL and caches it.
  Future<String> loadModelFromUrl(String url) async {
    if (url.isEmpty) throw Exception('Model URL is empty');

    // Map localhost to Android Emulator's host machine IP
    if (Platform.isAndroid && url.contains('localhost')) {
      url = url.replaceAll('localhost', '10.0.2.2');
    }

    final fileName = url.split('/').last.split('?').first;
    if (fileName.isEmpty) throw Exception('Invalid model URL');

    final dir = await getTemporaryDirectory();
    final cacheDir = Directory('${dir.path}/models_cache/remote');
    
    if (!(await cacheDir.exists())) {
      await cacheDir.create(recursive: true);
    }
    
    final File localFile = File('${cacheDir.path}/$fileName');

    // 1. Check local cache
    if (await localFile.exists()) {
      return 'file://${localFile.path}';
    }

    // 2. Try network download
    try {
      final uri = Uri.parse(url);
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 10);
      final request = await client.getUrl(uri);
      final response = await request.close();
      
      if (response.statusCode == 200 && response.headers.contentType?.mimeType != 'text/html') {
        await response.pipe(localFile.openWrite());
        return 'file://${localFile.path}';
      } else {
        debugPrint('Network fetch failed or returned HTML: Status ${response.statusCode}');
        throw Exception('Failed to download model');
      }
    } catch (e) {
      debugPrint('Network fetch failed: $e');
      rethrow;
    }
  }

  /// Clears the locally cached models.
  Future<void> clearCache() async {
    // To be implemented when file-system caching is added
    final dir = await getTemporaryDirectory();
    final cacheDir = Directory('${dir.path}/models_cache');
    if (await cacheDir.exists()) {
      await cacheDir.delete(recursive: true);
    }
  }
}
