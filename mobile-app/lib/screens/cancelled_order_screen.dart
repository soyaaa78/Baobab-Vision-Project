import 'dart:convert';

import 'package:flutter/material.dart';
import '../widgets/cancelled_order_card.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';
import '../services/api_client.dart';

class CancelledOrdersScreen extends StatefulWidget {
  const CancelledOrdersScreen({super.key});

  @override
  State<CancelledOrdersScreen> createState() => _CancelledOrdersScreenState();
}

class _CancelledOrdersScreenState extends State<CancelledOrdersScreen> {
  Future<List<Map<String, dynamic>>> _fetchCancelledOrders() async {
    // Single request for both cancelled and cancelled_pending
    final resp = await ApiClient.get(
        '/api/orders?status=cancelled&status=cancelled_pending');
    if (resp.statusCode != 200) {
      throw Exception('Failed to load cancelled orders');
    }
    final decoded = json.decode(resp.body);
    final allOrders = decoded is Map<String, dynamic> ? decoded['order'] : null;
    if (allOrders is! List) return [];

    final List<Map<String, dynamic>> flattened = allOrders
        .whereType<Map>()
        .map((o) => Map<String, dynamic>.from(o))
        .where((order) {
      final s = order['status']?.toString();
      return s == 'cancelled' || s == 'cancelled_pending';
    }).expand<Map<String, dynamic>>((order) {
      final products = order['products'];
      if (products is! List) return <Map<String, dynamic>>[];

      // Map cancellation to a display string per status
      final String cancellationStatus =
          order['status']?.toString() == 'cancelled_pending'
              ? 'Pending Cancellation'
              : 'Cancelled';

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

        // Handle both user cancellation and admin decline reasons
        final userCancellation = order['cancellationReason']?.toString() ?? '';
        final adminDecline = order['declineReason']?.toString() ?? '';
        final reasonText =
            adminDecline.isNotEmpty ? adminDecline : userCancellation;
        final reasonType =
            adminDecline.isNotEmpty ? 'Admin Declined' : 'User Cancelled';

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
          'cancellationStatus': cancellationStatus,
          'cancellationReason': reasonText,
          'reasonType': reasonType,
        };
      });
    }).toList();

    return flattened;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cancelled Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _fetchCancelledOrders(),
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
                text: 'No cancelled orders yet.',
                fontSize: 16,
                color: Colors.grey,
              ),
            );
          }
          final cancelledOrders = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: cancelledOrders.length,
            itemBuilder: (context, index) {
              final order = cancelledOrders[index];
              return CancelledOrderCard(
                productId: order['productId']?.toString() ?? '',
                prodName: order['prodName']?.toString() ?? '',
                quantity: order['quantity'] ?? 1,
                prodPrice: order['prodPrice']?.toString() ?? '',
                prodImages: List<String>.from(order['prodImages'] ?? []),
                selectedColorName: order['selectedColorName']?.toString() ?? '',
                selectedLensLabel: order['selectedLensLabel']?.toString() ?? '',
                deliveryMethod: order['deliveryMethod']?.toString() ?? '',
                paymentMethod: order['paymentMethod']?.toString() ?? '',
                cancellationStatus:
                    order['cancellationStatus']?.toString() ?? '',
                cancellationReason:
                    order['cancellationReason']?.toString() ?? '',
                reasonType: order['reasonType']?.toString() ?? '',
              );
            },
          );
        },
      ),
    );
  }
}
