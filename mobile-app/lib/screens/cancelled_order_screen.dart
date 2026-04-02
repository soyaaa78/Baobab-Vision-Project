import 'dart:convert';

import 'package:flutter/material.dart';
import '../widgets/expandable_order_card.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';
import '../services/api_client.dart';
import 'home_screen.dart';

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

    final List<Map<String, dynamic>> groupedOrders = allOrders
        .whereType<Map>()
        .map((o) => Map<String, dynamic>.from(o))
        .where((order) {
          final s = order['status']?.toString();
          return s == 'cancelled' || s == 'cancelled_pending';
        })
        .map((order) {
          final products = order['products'];
          if (products is! List) return null;

          final List<Map<String, dynamic>> processedProducts =
              products.map<Map<String, dynamic>>((p) {
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
            };
          }).toList();

          // Handle both user cancellation and admin decline reasons
          final userCancellation =
              order['cancellationReason']?.toString() ?? '';
          final adminDecline = order['declineReason']?.toString() ?? '';
          final reasonText =
              adminDecline.isNotEmpty ? adminDecline : userCancellation;
          final reasonType =
              adminDecline.isNotEmpty ? 'Admin Declined' : 'User Cancelled';

          // Parse order date
          DateTime? orderDate;
          final dateStr = order['date']?.toString();
          if (dateStr != null) {
            orderDate = DateTime.tryParse(dateStr);
          }

          DateTime? createdAt;
          final createdAtStr = order['createdAt']?.toString();
          if (createdAtStr != null) {
            createdAt = DateTime.tryParse(createdAtStr);
          }

          return {
            'mongoId': order['_id']?.toString() ?? '',
            'orderId':
                order['orderId']?.toString() ?? order['_id']?.toString() ?? '',
            'products': processedProducts,
            'deliveryMethod': order['deliveryMethod']?.toString() ?? '',
            'thirdPartyDelivery': order['thirdPartyDelivery']?.toString() ?? '',
            'status': order['status']?.toString() ?? 'cancelled',
            'orderDate': orderDate,
            'cancellationReason': reasonText,
            'reasonType': reasonType,
            'createdAt': createdAt,
          };
        })
        .whereType<Map<String, dynamic>>()
        .toList();

    groupedOrders.sort((a, b) {
      final aCreated = a['createdAt'] as DateTime?;
      final bCreated = b['createdAt'] as DateTime?;
      final aValue = aCreated ?? DateTime.fromMillisecondsSinceEpoch(0);
      final bValue = bCreated ?? DateTime.fromMillisecondsSinceEpoch(0);
      return bValue.compareTo(aValue);
    });

    return groupedOrders;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(
                builder: (_) => const HomeScreen(initialIndex: 3),
              ),
            );
          },
        ),
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
              final additionalInfo = <String, dynamic>{};
              final cancellationReason =
                  order['cancellationReason']?.toString() ?? '';
              final reasonType = order['reasonType']?.toString() ?? '';
              if (cancellationReason.isNotEmpty) {
                additionalInfo['cancellationReason'] = cancellationReason;
              }
              if (reasonType.isNotEmpty) {
                additionalInfo['reasonType'] = reasonType;
              }
              return ExpandableOrderCard(
                orderId: order['orderId']?.toString() ?? '',
                products:
                    List<Map<String, dynamic>>.from(order['products'] ?? []),
                deliveryMethod: order['deliveryMethod']?.toString() ?? '',
                thirdPartyDelivery:
                    order['thirdPartyDelivery']?.toString() ?? '',
                status: order['status']?.toString() ?? 'cancelled',
                orderDate: order['orderDate'],
                additionalInfo:
                    additionalInfo.isNotEmpty ? additionalInfo : null,
              );
            },
          );
        },
      ),
    );
  }
}
