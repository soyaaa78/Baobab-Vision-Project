import 'dart:io';
import 'package:flutter/material.dart';

import '../models/productModel.dart';
import '../screens/native_vto_screen.dart';
import '../screens/vto_screen.dart';
import 'ar_session_service.dart';

class VtoRouter {
  static Future<void> navigateToVto(
    BuildContext context,
    Product product,
    ColorOption selectedColor, {
    List<Product>? allProducts,
  }) async {
    final String? model3dUrl = selectedColor.model3dUrl ?? product.model3dUrl;

    // check if user device can use native AR experience
    if (Platform.isAndroid) {
      final isSupported = await ArSessionService.isFaceTrackingSupported();
      if (isSupported && model3dUrl != null && model3dUrl.isNotEmpty) {
        if (!context.mounted) return;
        
        await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => NativeVtoScreen(
              product: product,
              initialColor: selectedColor,
              allProducts: allProducts,
            ),
          ),
        );
        return;
      }
    }

    // fallback to the legacy WebView experience
    if (!context.mounted) return;

    final modelSlug = product.name.trim().toLowerCase().replaceAll(' ', '-');
    final variantSlug = selectedColor.name.trim().toLowerCase().replaceAll(' ', '-');

    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => VirtualTryOnScreen(
          modelSlug: modelSlug,
          variantSlug: variantSlug,
        ),
      ),
    );
  }
}
