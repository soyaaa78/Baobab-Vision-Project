import 'package:baobab_vision_project/widgets/expandable_order_card.dart';
import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'dart:convert';
import '../widgets/custom_text.dart';
import '../constants.dart';
import 'home_screen.dart';

class ProcessingOrdersScreen extends StatefulWidget {
  const ProcessingOrdersScreen({super.key});

  @override
  State<ProcessingOrdersScreen> createState() => _ProcessingOrdersScreenState();
}

class _ProcessingOrdersScreenState extends State<ProcessingOrdersScreen>
    with WidgetsBindingObserver {
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _future = fetchProcessingOrders();
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
      _future = fetchProcessingOrders();
    });
  }

  Future<List<Map<String, dynamic>>> fetchProcessingOrders() async {
    final response = await ApiClient.get('/api/orders?status=processing');
    if (response.statusCode != 200) {
      throw Exception('Failed to load processing orders');
    }

    final data = json.decode(response.body);
    final rawOrders = data is Map<String, dynamic> ? data['order'] : null;
    if (rawOrders is! List) return [];

    final List<Map<String, dynamic>> groupedOrders = rawOrders
        .whereType<Map>()
        .map((o) => Map<String, dynamic>.from(o))
        .where((order) {
          final status = order['status']?.toString();
          final deliveryMethod = order['deliveryMethod']?.toString() ?? '';
          return status == 'processing' &&
              deliveryMethod != 'Third-Party Delivery';
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
              'prodPrice': prodPrice,
              'quantity': quantity,
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

          DateTime? createdAt;
          final createdAtStr = order['createdAt']?.toString();
          if (createdAtStr != null) {
            createdAt = DateTime.tryParse(createdAtStr);
          }

          return {
            'orderId':
                order['orderId']?.toString() ?? order['_id']?.toString() ?? '',
            'products': processedProducts,
            'deliveryMethod': order['deliveryMethod']?.toString() ?? '',
            'thirdPartyDelivery': order['thirdPartyDelivery']?.toString() ?? '',
            'status': order['status']?.toString() ?? 'processing',
            'orderDate': orderDate,
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
        title: const Text('Processing Orders'),
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
                text: 'No orders are being processed currently.',
                fontSize: 16,
                color: Colors.grey,
              ),
            );
          }
          final orders = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                return ExpandableOrderCard(
                  orderId: order['orderId']?.toString() ?? '',
                  products:
                      List<Map<String, dynamic>>.from(order['products'] ?? []),
                  deliveryMethod: order['deliveryMethod']?.toString() ?? '',
                  thirdPartyDelivery:
                      order['thirdPartyDelivery']?.toString() ?? '',
                  status: order['status']?.toString() ?? 'processing',
                  orderDate: order['orderDate'],
                );
              },
            ),
          );
        },
      ),
    );
  }
}
