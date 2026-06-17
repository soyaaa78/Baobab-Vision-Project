import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path_provider/path_provider.dart';

class ModelLoaderService {
  final String _baseUrl = 'https://r2.your-domain.com/models'; // Placeholder for Integration Day

  /// Resolves the correct path for a `.glb` file.
  /// 
  /// Downloads from the network, caches the file locally, and returns the local path.
  /// Falls back to local bundled assets if network fails or file is bundled.
  Future<String> loadModel(String productFolder, String variantName) async {
    final fileName = '$variantName.glb';
    final dir = await getTemporaryDirectory();
    final cacheDir = Directory('${dir.path}/models_cache/$productFolder');
    
    if (!(await cacheDir.exists())) {
      await cacheDir.create(recursive: true);
    }
    
    final File localFile = File('${cacheDir.path}/$fileName');

    // 1. Check local cache
    if (await localFile.exists()) {
      return localFile.path;
    }

    // 2. Try network download (Integration Day)
    // Note: Since this is a placeholder URL, this will likely fail during dev
    // and naturally fallback to step 3.
    try {
      final url = Uri.parse('$_baseUrl/$productFolder/$fileName');
      // Using HttpClient directly to avoid adding 'http' package to pubspec if not strictly needed
      // Actually, 'http' is in pubspec, but dart:io HttpClient is built-in and sufficient here.
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 5);
      final request = await client.getUrl(url);
      final response = await request.close();
      
      if (response.statusCode == 200) {
        await response.pipe(localFile.openWrite());
        return localFile.path;
      }
    } catch (e) {
      debugPrint('Network fetch failed, falling back to bundled asset: $e');
    }

    // 3. Fallback to bundled assets for development
    final String assetPath = 'assets/models/$productFolder/$variantName.glb';
    try {
      // We just verify it exists and return the asset path directly.
      await rootBundle.load(assetPath);
      return assetPath;
    } catch (e) {
      throw Exception('Failed to load model from both network and local assets: $assetPath');
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
