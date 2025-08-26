import 'package:baobab_vision_project/widgets/processing_order_card.dart';
import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'dart:convert';
import '../widgets/custom_text.dart';
import '../constants.dart';

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
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final orders = (data['order'] as List)
          .where((order) => order['status'] == 'processing')
          .expand((order) {
        final products = order['products'] as List? ?? [];
        return products.map((product) {
          final productId = product['productId'];
          final prodName = productId?['name'] ?? '';
          final imageUrls = productId?['imageUrls'] ?? [];
          final prodImages = imageUrls is List && imageUrls.isNotEmpty
              ? [imageUrls.first]
              : [];
          // Resolve color name and value
          String selectedColorName = '';
          String selectedColorValue = '';
          final colorId = product['color'];
          final colorOptions = productId?['colorOptions'] ?? [];
          if (colorId != null && colorOptions is List) {
            final colorObj = colorOptions.firstWhere(
              (c) => c['_id'] == colorId,
              orElse: () => null,
            );
            if (colorObj != null) {
              selectedColorName = colorObj['name'] ?? '';
              if (colorObj['colors'] is List && colorObj['colors'].isNotEmpty) {
                selectedColorValue = colorObj['colors'][0];
              }
            }
          }
          // Resolve lens label
          String selectedLensLabel = '';
          final lensId = product['lens'];
          final lensOptions = productId?['lensOptions'] ?? [];
          if (lensId != null && lensOptions is List) {
            final lensObj = lensOptions.firstWhere(
              (l) => l['_id'] == lensId,
              orElse: () => null,
            );
            if (lensObj != null) {
              selectedLensLabel = lensObj['label'] ?? '';
            }
          }
          return {
            'productId':
                productId is Map ? productId['_id'] ?? '' : productId ?? '',
            'prodName': prodName,
            'quantity': product['quantity'] ?? 1,
            'prodPrice': product['price']?.toString() ?? '',
            'prodImages': prodImages,
            'selectedColorName': selectedColorName,
            'selectedColorValue': selectedColorValue,
            'selectedLensLabel': selectedLensLabel,
            'deliveryMethod': order['deliveryMethod'] ?? '',
            'paymentMethod': order['paymentMethod'] ?? '',
          };
        });
      }).toList();
      return orders.cast<Map<String, dynamic>>();
    } else {
      throw Exception('Failed to load processing orders');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
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
                return ProcessingOrderCard(
                  productId: order['productId']?.toString() ?? '',
                  prodName: order['prodName']?.toString() ?? '',
                  quantity: order['quantity'] ?? 1,
                  prodPrice: order['prodPrice']?.toString() ?? '',
                  prodImages: List<String>.from(order['prodImages'] ?? []),
                  selectedColorName:
                      order['selectedColorName']?.toString() ?? '',
                  selectedLensLabel:
                      order['selectedLensLabel']?.toString() ?? '',
                  deliveryMethod: order['deliveryMethod']?.toString() ?? '',
                  paymentMethod: order['paymentMethod']?.toString() ?? '',
                );
              },
            ),
          );
        },
      ),
    );
  }
}
