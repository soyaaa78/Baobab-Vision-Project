import 'package:flutter/material.dart';
import '../services/api_client.dart';
import 'dart:convert';
import '../constants.dart';
// import '../models/productModel.dart';
import '../widgets/pending_order_card.dart';
import '../widgets/custom_text.dart';

class PendingOrdersScreen extends StatefulWidget {
  const PendingOrdersScreen({super.key});

  @override
  State<PendingOrdersScreen> createState() => _PendingOrdersScreenState();
}

class _PendingOrdersScreenState extends State<PendingOrdersScreen>
    with WidgetsBindingObserver {
  late Future<List<Map<String, dynamic>>> _future;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _future = fetchPendingOrders();
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
      _future = fetchPendingOrders();
    });
  }
  Future<List<Map<String, dynamic>>> fetchPendingOrders() async {
    final response = await ApiClient.get('/api/orders?status=pending');
    if (response.statusCode != 200) {
      throw Exception('Failed to load pending orders');
    }

    final data = json.decode(response.body);
    final rawOrders = data is Map<String, dynamic> ? data['order'] : null;
    if (rawOrders is! List) return [];

    final List<Map<String, dynamic>> flattened = rawOrders
        .whereType<Map>()
        .map((o) => Map<String, dynamic>.from(o))
        .where((order) => order['status']?.toString() == 'pending')
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

        // Rating value if present
        int numStars = 0;
        final rating = order['rating'];
        if (rating is int) {
          numStars = rating;
        } else if (rating is Map) {
          final r = Map<String, dynamic>.from(rating);
          final candidate = r['numStars'] ?? r['stars'];
          if (candidate is int) numStars = candidate;
          if (candidate is String) numStars = int.tryParse(candidate) ?? 0;
        }

        return {
          'orderId': order['_id']?.toString() ?? '',
          'productId': productIdForCard,
          'prodName': prodName,
          'prodPrice': prodPrice,
          'numStars': numStars,
          'quantity': quantity,
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
        title: const Text('Pending Orders'),
        backgroundColor: WHITE_COLOR,
        foregroundColor: Colors.black,
        elevation: 1,
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
                text: 'No pending orders yet.',
                fontSize: 16,
                color: Colors.grey,
              ),
            );
          }
          final pendingOrders = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: pendingOrders.length,
              itemBuilder: (context, index) {
                final product = pendingOrders[index];
              final orderId = product['orderId']?.toString() ?? '';

                return PendingOrderCard(
                productId: product["productId"]?.toString() ?? '',
                prodName: product["prodName"]?.toString() ?? '',
                prodPrice: product["prodPrice"]?.toString() ?? '',
                numStars: product["numStars"] ?? 0,
                quantity: product["quantity"] ?? 1,
                prodImages: List<String>.from(product["prodImages"] ?? []),
                selectedColorName:
                    product["selectedColorName"]?.toString() ?? '',
                selectedLensLabel:
                    product["selectedLensLabel"]?.toString() ?? '',
                deliveryMethod: product["deliveryMethod"]?.toString() ?? '',
                paymentMethod: product["paymentMethod"]?.toString() ?? '',
                onCancel: () {
                  showDialog(
                    context: context,
                    builder: (context) {
                      TextEditingController reasonController =
                          TextEditingController();
                      return AlertDialog(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        title: Column(
                          children: [
                            Icon(Icons.cancel, color: Colors.red, size: 40),
                            const SizedBox(height: 8),
                            const Text(
                              "Are you sure you want to cancel this order?",
                              textAlign: TextAlign.center,
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                        content: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            TextField(
                              controller: reasonController,
                              maxLines: 3,
                              decoration: InputDecoration(
                                hintText:
                                    "Why do you want to cancel this order?",
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              "* NOTICE: Your request will be solved in 24 hours",
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.black,
                              ),
                            ),
                          ],
                        ),
                        actionsAlignment: MainAxisAlignment.spaceEvenly,
                        actions: [
                          TextButton(
                            onPressed: () {
                              Navigator.pop(context); // close popup
                            },
                            style: TextButton.styleFrom(
                              backgroundColor: Colors.grey[300],
                              minimumSize: const Size(80, 40),
                            ),
                            child: const Text("NO",
                                style: TextStyle(color: Colors.black)),
                          ),
                          TextButton(
                            onPressed: () async {
                              final reason = reasonController.text.trim();
                              if (reason.isEmpty) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                        "Please provide a reason before submitting."),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                                return;
                              }
                              Navigator.pop(context); // close confirm dialog

                              try {
                                final resp = await ApiClient.putJson(
                                  '/api/orders',
                                  {
                                    'id': orderId,
                                    'status': 'cancelled_pending',
                                    // Optional: send reason for auditing, backend may ignore
                                    'cancellationReason': reason,
                                  },
                                );
                                if (resp.statusCode == 200) {
                                  // Refresh list
                                  if (mounted) {
                                    setState(() {});
                                  }
                                  showDialog(
                                    context: context,
                                    builder: (context) {
                                      return AlertDialog(
                                        title: const Text("Cancelled"),
                                        content: const Text(
                                            "Your order was cancelled successfully."),
                                        actions: [
                                          TextButton(
                                            onPressed: () =>
                                                Navigator.pop(context),
                                            child: const Text("OK"),
                                          ),
                                        ],
                                      );
                                    },
                                  );
                                } else {
                                  throw Exception('Failed with status ' +
                                      resp.statusCode.toString());
                                }
                              } catch (e) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('Failed to cancel order: $e'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            },
                            style: TextButton.styleFrom(
                              backgroundColor: Colors.black,
                              minimumSize: const Size(80, 40),
                            ),
                            child: const Text("YES",
                                style: TextStyle(color: Colors.white)),
                          ),
                        ],
                      );
                    },
                  );
                },
                );
              },
            ),
          );
        },
      ),
    );
  }
}
