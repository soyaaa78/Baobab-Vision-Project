import 'package:flutter/material.dart';
import '../widgets/delivery_order_card.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';

class DeliveryOrdersScreen extends StatelessWidget {
  const DeliveryOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Example delivery orders (replace with your real data)
    final deliveryOrders = [
      {
        "productName": "Classic Black Eyeglasses",
        "quantity": 1,
        "prodPrice": "1200",
        "prodImages": ["https://via.placeholder.com/150"],
        "selectedColorName": "Black",
        "selectedLensLabel": "Standard Lens",
        "deliveryMethod": "Third-Party Delivery",
        "paymentMethod": "COD",
        "deliveryStatus": "Picked Up",
      },
      {
        "productName": "Blue Light Glasses",
        "quantity": 2,
        "prodPrice": "1500",
        "prodImages": ["https://via.placeholder.com/150"],
        "selectedColorName": "Blue",
        "selectedLensLabel": "Anti-Reflective",
        "deliveryMethod": "Third-Party Delivery",
        "paymentMethod": "Credit Card",
        "deliveryStatus": "In Transit",
      },
      {
        "productName": "Reading Glasses",
        "quantity": 1,
        "prodPrice": "800",
        "prodImages": ["https://via.placeholder.com/150"],
        "selectedColorName": "Brown",
        "selectedLensLabel": "Standard Lens",
        "deliveryMethod": "Third-Party Delivery",
        "paymentMethod": "COD",
        "deliveryStatus": "Delivered",
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: deliveryOrders.isEmpty
          ? Center(
              child: CustomText(
                text: 'No delivery orders yet.',
                fontSize: 16,
                color: Colors.grey,
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: deliveryOrders.length,
              itemBuilder: (context, index) {
                final order = deliveryOrders[index];
                return DeliveryOrderCard(
                  productId: index.toString(),
                  prodName: order['productName'] as String,
                  quantity: order['quantity'] as int,
                  prodPrice: order['prodPrice'] as String,
                  prodImages: List<String>.from(order['prodImages'] as List),
                  selectedColorName: order['selectedColorName'] as String,
                  selectedLensLabel: order['selectedLensLabel'] as String,
                  deliveryMethod: order['deliveryMethod'] as String,
                  paymentMethod: order['paymentMethod'] as String,
                  deliveryStatus: order['deliveryStatus'] as String,
                );
              },
            ),
    );
  }
}
