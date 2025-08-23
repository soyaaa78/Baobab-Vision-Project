import 'package:baobab_vision_project/screens/rate_input_screen.dart';
import 'package:baobab_vision_project/widgets/to_rate_order_card.dart';
import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'dart:convert';
import '../widgets/custom_text.dart';
import '../constants.dart';

class ToRateScreen extends StatefulWidget {
  const ToRateScreen({super.key});

  @override
  State<ToRateScreen> createState() => _ToRateScreenState();
}

class _ToRateScreenState extends State<ToRateScreen> {
  Future<List<Map<String, dynamic>>> fetchToRateOrders() async {
    final response = await ApiClient.get('/api/orders?status=completed');
    if (response.statusCode != 200) {
      throw Exception('Failed to load orders to rate');
    }

    final data = json.decode(response.body);
    final rawOrders = data is Map<String, dynamic> ? data['order'] : null;
    if (rawOrders is! List) return [];

    final List<Map<String, dynamic>> flattened = rawOrders
        .whereType<Map>()
        .map((o) => Map<String, dynamic>.from(o))
        .where((order) => order['status']?.toString() == 'completed')
        .expand<Map<String, dynamic>>((order) {
      final String orderId = order['_id']?.toString() ?? '';
      final bool orderRated = order['rating'] != null;
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

        // Rating value (use 0 if not available or not numeric)
        int numStars = 0;
        final rating = order['rating'];
        if (rating is int) {
          numStars = rating;
        } else if (rating is Map) {
          final r = Map<String, dynamic>.from(rating);
          final candidate = r['numStars'] ?? r['stars'];
          if (candidate is int) numStars = candidate;
          if (candidate is String) {
            numStars = int.tryParse(candidate) ?? 0;
          }
        }

        final productIdForCard = productId?['_id']?.toString() ??
            (product['productId']?.toString() ?? '');
        final quantity = product['quantity'] is int
            ? product['quantity'] as int
            : int.tryParse(product['quantity']?.toString() ?? '') ?? 1;
        final prodPrice = product['price']?.toString() ?? '';

        return {
          'orderId': orderId,
          'orderRated': orderRated,
          'productId': productIdForCard,
          'prodName': prodName,
          'numStars': numStars,
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

    // Keep only unique, unrated orders by orderId
    final seen = <String>{};
    final filtered = <Map<String, dynamic>>[];
    for (final item in flattened) {
      final oid = item['orderId']?.toString() ?? '';
      final rated = item['orderRated'] == true;
      if (oid.isEmpty || rated) continue;
      if (seen.add(oid)) filtered.add(item);
    }

    return filtered;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('To Rate Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: fetchToRateOrders(),
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
                text: 'No orders to rate.',
                fontSize: 16,
                color: Colors.grey,
              ),
            );
          }
          final orders = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final order = orders[index];
              return ToRateOrderCard(
                productId: order['productId']?.toString() ?? '',
                prodName: order['prodName']?.toString() ?? '',
                numStars: order['numStars'] ?? 0,
                quantity: order['quantity'] ?? 1,
                prodPrice: order['prodPrice']?.toString() ?? '',
                prodImages: List<String>.from(order['prodImages'] ?? []),
                selectedColorName: order['selectedColorName']?.toString() ?? '',
                selectedLensLabel: order['selectedLensLabel']?.toString() ?? '',
                deliveryMethod: order['deliveryMethod']?.toString() ?? '',
                paymentMethod: order['paymentMethod']?.toString() ?? '',
                onRate: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => RateInputScreen(
                        productName: order['prodName']?.toString() ?? '',
                        orderId: order['orderId']?.toString() ?? '',
                      ),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}
