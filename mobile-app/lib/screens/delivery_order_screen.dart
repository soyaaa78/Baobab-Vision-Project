import 'dart:convert';

import 'package:flutter/material.dart';
import '../widgets/expandable_order_card.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';
import '../services/api_client.dart';
import 'home_screen.dart';

class DeliveryOrdersScreen extends StatefulWidget {
  const DeliveryOrdersScreen({super.key});

  @override
  State<DeliveryOrdersScreen> createState() => _DeliveryOrdersScreenState();
}

class _DeliveryOrdersScreenState extends State<DeliveryOrdersScreen>
    with WidgetsBindingObserver {
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _future = _fetchDeliveryOrders();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _refresh();
    }
  }

  Future<void> _refresh() async {
    setState(() {
      _future = _fetchDeliveryOrders();
    });
  }

  Future<List<Map<String, dynamic>>> _fetchDeliveryOrders() async {
    final resp =
        await ApiClient.get('/api/orders?&deliveryMethod=Third-Party Delivery');
    if (resp.statusCode != 200) {
      throw Exception('Failed to load delivery orders');
    }

    final data = json.decode(resp.body);
    final rawOrders = data is Map<String, dynamic> ? data['order'] : null;
    if (rawOrders is! List) return [];

    // Flatten orders to product cards; include only third-party delivery
    final allowed = {'pending', 'preparing', 'ready_to_pickup', 'completed'};
    final List<Map<String, dynamic>> groupedOrders = rawOrders
        .whereType<Map>()
        .map((o) => Map<String, dynamic>.from(o))
        .where((order) =>
            (order['deliveryMethod']?.toString() ?? '') ==
                'Third-Party Delivery' &&
            allowed.contains(order['status']?.toString()))
        .map((order) {
          final products = order['products'];
          if (products is! List) return null;

          String deliveryStatus;
          switch (order['status']?.toString()) {
            case 'pending':
              deliveryStatus = 'pending';
              break;
            case 'preparing':
            case 'ready_to_pickup':
              deliveryStatus = 'processing';
              break;
            default:
              deliveryStatus = 'completed';
          }

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

          // Parse order date
          DateTime? orderDate;
          final dateStr = order['date']?.toString();
          if (dateStr != null) {
            orderDate = DateTime.tryParse(dateStr);
          }

          return {
            'orderId':
                order['orderId']?.toString() ?? order['_id']?.toString() ?? '',
            'products': processedProducts,
            'deliveryMethod': order['deliveryMethod']?.toString() ?? '',
            'paymentMethod': order['paymentMethod']?.toString() ?? '',
            'status': deliveryStatus,
            'orderDate': orderDate,
            'thirdPartyDelivery': order['thirdPartyDelivery']?.toString() ?? '',
          };
        })
        .whereType<Map<String, dynamic>>()
        .toList();

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
        title: const Text('Delivery Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _future,
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
                text: 'No delivery orders yet.',
                fontSize: 16,
                color: Colors.grey,
              ),
            );
          }
          final deliveryOrders = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: deliveryOrders.length,
              itemBuilder: (context, index) {
                final order = deliveryOrders[index];
                final additionalInfo = <String, dynamic>{};
                final thirdPartyDelivery =
                    order['thirdPartyDelivery']?.toString() ?? '';
                if (thirdPartyDelivery.isNotEmpty) {
                  additionalInfo['thirdPartyDelivery'] = thirdPartyDelivery;
                }
                return ExpandableOrderCard(
                  orderId: order['orderId']?.toString() ?? '',
                  products:
                      List<Map<String, dynamic>>.from(order['products'] ?? []),
                  deliveryMethod: order['deliveryMethod']?.toString() ?? '',
                  thirdPartyDelivery:
                      order['thirdPartyDelivery']?.toString() ?? '',
                  status: order['status']?.toString() ?? 'pending',
                  orderDate: order['orderDate'],
                  additionalInfo:
                      additionalInfo.isNotEmpty ? additionalInfo : null,
                );
              },
            ),
          );
        },
      ),
    );
  }
}
