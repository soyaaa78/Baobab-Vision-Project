import 'dart:convert';

import 'package:baobab_vision_project/widgets/completed_order_card.dart';
import 'package:flutter/material.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';
import '../services/api_client.dart';

class CompletedPurchasesScreen extends StatefulWidget {
  const CompletedPurchasesScreen({super.key});

  @override
  State<CompletedPurchasesScreen> createState() =>
      _CompletedPurchasesScreenState();
}

class _CompletedPurchasesScreenState extends State<CompletedPurchasesScreen> {
  Future<List<Map<String, dynamic>>> _fetchCompletedOrders() async {
    final resp = await ApiClient.get('/api/orders?status=completed');
    if (resp.statusCode != 200) {
      throw Exception('Failed to load completed purchases');
    }

    final data = json.decode(resp.body);
    final rawOrders = data is Map<String, dynamic> ? data['order'] : null;
    if (rawOrders is! List) return [];

    final List<Map<String, dynamic>> flattened = rawOrders
        .whereType<Map>()
        .map((o) => Map<String, dynamic>.from(o))
        .where((order) => order['status']?.toString() == 'completed')
        .expand<Map<String, dynamic>>((order) {
      final products = order['products'];
      if (products is! List) return <Map<String, dynamic>>[];

      return products.map<Map<String, dynamic>>((p) {
        final product = Map<String, dynamic>.from(p as Map);
        final productIdRaw = product['productId'];
        final Map<String, dynamic>? productId = productIdRaw is Map
            ? Map<String, dynamic>.from(productIdRaw)
            : null;

        final String prodName = productId?['name']?.toString() ?? '';

        final imageUrls = productId?['imageUrls'];
        final List<String> prodImages = (imageUrls is List)
            ? imageUrls.whereType<String>().toList().take(1).toList()
            : <String>[];

        // Resolve color name
        String selectedColorName = '';
        final String? colorId = product['color']?.toString();
        final colorOptionsRaw = productId?['colorOptions'];
        if (colorId != null && colorOptionsRaw is List) {
          final List<Map<String, dynamic>> colorOptions = colorOptionsRaw
              .whereType<Map>()
              .map((m) => Map<String, dynamic>.from(m))
              .toList();
          final colorObj = colorOptions.firstWhere(
            (c) => c['_id']?.toString() == colorId,
            orElse: () => <String, dynamic>{},
          );
          if (colorObj.isNotEmpty) {
            selectedColorName = colorObj['name']?.toString() ?? '';
          }
        }

        // Resolve lens label
        String selectedLensLabel = '';
        final String? lensId = product['lens']?.toString();
        final lensOptionsRaw = productId?['lensOptions'];
        if (lensId != null && lensOptionsRaw is List) {
          final List<Map<String, dynamic>> lensOptions = lensOptionsRaw
              .whereType<Map>()
              .map((m) => Map<String, dynamic>.from(m))
              .toList();
          final lensObj = lensOptions.firstWhere(
            (l) => l['_id']?.toString() == lensId,
            orElse: () => <String, dynamic>{},
          );
          if (lensObj.isNotEmpty) {
            selectedLensLabel = lensObj['label']?.toString() ?? '';
          }
        }

        final productIdForCard = productId?['_id']?.toString() ??
            (product['productId']?.toString() ?? '');
        final quantity = product['quantity'] is int
            ? product['quantity'] as int
            : int.tryParse(product['quantity']?.toString() ?? '') ?? 1;
        final prodPrice = product['price']?.toString() ?? '';

        return {
          'productId': productIdForCard,
          'prodName': prodName,
          'quantity': quantity,
          'prodPrice': prodPrice,
          'prodImages': prodImages,
          'selectedColorName': selectedColorName,
          'selectedLensLabel': selectedLensLabel,
          'deliveryMethod': order['deliveryMethod']?.toString() ?? '',
          'paymentMethod': order['paymentMethod']?.toString() ?? '',
        };
      });
    }).toList();

    return flattened;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Completed Purchases'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _fetchCompletedOrders(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(
                child: CustomText(
                    text: 'Error: ${snapshot.error}',
                    fontSize: 16,
                    color: Colors.red));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
              child: CustomText(
                text: 'No completed purchases yet.',
                fontSize: 16,
                color: Colors.grey,
              ),
            );
          }
          final completed = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: completed.length,
            itemBuilder: (context, index) {
              final item = completed[index];
              return CompletedOrderCard(
                productId: item['productId']?.toString() ?? '',
                prodName: item['prodName']?.toString() ?? '',
                quantity: item['quantity'] ?? 1,
                prodPrice: item['prodPrice']?.toString() ?? '',
                prodImages: List<String>.from(item['prodImages'] ?? []),
                selectedColorName: item['selectedColorName']?.toString() ?? '',
                selectedLensLabel: item['selectedLensLabel']?.toString() ?? '',
                deliveryMethod: item['deliveryMethod']?.toString() ?? '',
                paymentMethod: item['paymentMethod']?.toString() ?? '',
              );
            },
          );
        },
      ),
    );
  }
}
