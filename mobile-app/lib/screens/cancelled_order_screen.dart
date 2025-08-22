import 'package:flutter/material.dart';
import '../widgets/cancelled_order_card.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';

class CancelledOrdersScreen extends StatelessWidget {
  const CancelledOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Example cancelled orders (replace with your real data)
    final cancelledOrders = [
      {
        "productName": "Classic Black Eyeglasses",
        "quantity": 1,
        "prodPrice": "1200",
        "prodImages": ["https://via.placeholder.com/150"],
        "selectedColorName": "Black",
        "selectedLensLabel": "Standard Lens",
        "deliveryMethod": "Home Delivery",
        "paymentMethod": "COD",
        "cancellationStatus": "Pending",
      },
      {
        "productName": "Blue Light Glasses",
        "quantity": 2,
        "prodPrice": "1500",
        "prodImages": ["https://via.placeholder.com/150"],
        "selectedColorName": "Blue",
        "selectedLensLabel": "Anti-Reflective",
        "deliveryMethod": "Pick-up",
        "paymentMethod": "Credit Card",
        "cancellationStatus": "Approved",
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Cancelled Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: cancelledOrders.isEmpty
          ? Center(
              child: CustomText(
                text: 'No cancelled orders yet.',
                fontSize: 16,
                color: Colors.grey,
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: cancelledOrders.length,
              itemBuilder: (context, index) {
                final order = cancelledOrders[index];
                return CancelledOrderCard(
  productId: index.toString(),
  prodName: order['productName'] as String,
  quantity: order['quantity'] as int,
  prodPrice: order['prodPrice'] as String,
  prodImages: List<String>.from(order['prodImages'] as List),
  selectedColorName: order['selectedColorName'] as String,
  selectedLensLabel: order['selectedLensLabel'] as String,
  deliveryMethod: order['deliveryMethod'] as String,
  paymentMethod: order['paymentMethod'] as String,
  cancellationStatus: order['cancellationStatus'] as String,
);

              },
            ),
    );
  }
}
