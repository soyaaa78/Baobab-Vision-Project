import 'package:baobab_vision_project/widgets/pickup_order_card.dart';
import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'dart:convert';
import '../constants.dart';
import '../widgets/custom_text.dart';

class ReadyForPickupOrdersScreen extends StatefulWidget {
  const ReadyForPickupOrdersScreen({super.key});

  @override
  State<ReadyForPickupOrdersScreen> createState() =>
      _ReadyForPickupOrdersScreenState();
}

class _ReadyForPickupOrdersScreenState
    extends State<ReadyForPickupOrdersScreen> with WidgetsBindingObserver {
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _future = fetchReadyForPickupOrders();
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
      _future = fetchReadyForPickupOrders();
    });
  }
  Future<List<Map<String, dynamic>>> fetchReadyForPickupOrders() async {
    final response = await ApiClient.get('/api/orders?status=ready_to_pickup');
    if (response.statusCode != 200) {
      throw Exception('Failed to load orders');
    }

    final data = json.decode(response.body);
    final rawOrders = data is Map<String, dynamic> ? data['order'] : null;
    if (rawOrders is! List) return [];

    final List<Map<String, dynamic>> flattened = rawOrders
        .whereType<Map>()
        .map((o) => Map<String, dynamic>.from(o))
        .where((order) => order['status']?.toString() == 'ready_to_pickup')
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

        // Resolve color name and value
        String selectedColorName = '';
        String selectedColorValue = '';
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
            final colors = colorObj['colors'];
            if (colors is List && colors.isNotEmpty) {
              final firstColor = colors.first;
              if (firstColor is String) selectedColorValue = firstColor;
            }
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
          'selectedColorValue': selectedColorValue,
          'selectedLensLabel': selectedLensLabel,
          'deliveryMethod': order['deliveryMethod']?.toString() ?? '',
          'paymentMethod': order['paymentMethod']?.toString() ?? '',
          'pickupLocation': order['pickupLocation']?.toString() ?? '',
          'pickupTime': order['pickupTime']?.toString() ?? '',
        };
      });
    }).toList();

    return flattened;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ready for Pickup Orders'),
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
                text: 'No orders ready for pick-up.',
                fontSize: 16,
                color: Colors.grey,
              ),
            );
          }
          final orders = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                return PickupOrderCard(
                productId: order['productId']?.toString() ?? '',
                prodName: order['prodName']?.toString() ?? '',
                quantity: order['quantity'] ?? 1,
                prodPrice: order['prodPrice']?.toString() ?? '',
                prodImages: List<String>.from(order['prodImages'] ?? []),
                selectedColorName: order['selectedColorName']?.toString() ?? '',
                selectedLensLabel: order['selectedLensLabel']?.toString() ?? '',
                deliveryMethod: order['deliveryMethod']?.toString() ?? '',
                paymentMethod: order['paymentMethod']?.toString() ?? '',
                pickupLocation: order['pickupLocation']?.toString() ?? '',
                pickupTime: order['pickupTime']?.toString() ?? '',
                );
              },
            ),
          );
        },
      ),
    );
  }
}
