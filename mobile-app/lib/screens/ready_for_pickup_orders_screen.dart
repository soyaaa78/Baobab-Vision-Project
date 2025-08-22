import 'package:baobab_vision_project/widgets/pickup_order_card.dart';
import 'package:flutter/material.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';

class ReadyForPickupOrdersScreen extends StatelessWidget {
  const ReadyForPickupOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Updated example list of orders with pickup location and time
    final orders = [
      {
        "productId": "1",
        "prodName": "Classic Black Eyeglasses",
        "quantity": 2,
        "prodPrice": "1200",
        "prodImages": [
          "https://example.com/eyeglasses1.jpg"
        ],
        "selectedColorName": "Black",
        "selectedLensLabel": "Clear",
        "deliveryMethod": "For Pick-up",
        "paymentMethod": "Cash on Delivery",
        "pickupLocation": "Baobab Store, Makati City", // new
        "pickupTime": "Aug 22, 2025, 3:00 PM",         // new
      },
      {
        "productId": "2",
        "prodName": "Aviator Sunglasses",
        "quantity": 1,
        "prodPrice": "1500",
        "prodImages": [
          "https://example.com/sunglasses1.jpg"
        ],
        "selectedColorName": "Gold",
        "selectedLensLabel": "Polarized",
        "deliveryMethod": "For Pick-up",
        "paymentMethod": "GCash",
        "pickupLocation": "Baobab Store, Quezon City", // new
        "pickupTime": "Aug 23, 2025, 11:00 AM",        // new
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ready for Pickup Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: orders.isEmpty
          ? Center(
              child: CustomText(
                text: 'No orders ready for pick-up.',
                fontSize: 16,
                color: Colors.grey,
              ),
            )
          : ListView.builder(
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                return PickupOrderCard(
                  productId: order['productId'] as String,
                  prodName: order['prodName'] as String,
                  quantity: order['quantity'] as int,
                  prodPrice: order['prodPrice'] as String,
                  prodImages: List<String>.from(order['prodImages'] as List),
                  selectedColorName: order['selectedColorName'] as String,
                  selectedLensLabel: order['selectedLensLabel'] as String,
                  deliveryMethod: order['deliveryMethod'] as String,
                  paymentMethod: order['paymentMethod'] as String,
                  pickupLocation: order['pickupLocation'] as String, // new
                  pickupTime: order['pickupTime'] as String,         // new
                );
              },
            ),
    );
  }
}