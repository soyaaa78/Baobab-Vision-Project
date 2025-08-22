import 'package:baobab_vision_project/widgets/completed_order_card.dart';
import 'package:flutter/material.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';

class CompletedPurchasesScreen extends StatelessWidget {
  const CompletedPurchasesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Completed Purchases'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: ListView(
  padding: const EdgeInsets.all(8),
  children: [
    CompletedOrderCard(
      productId: '1',
      prodName: 'Classic Black Eyeglasses',
      quantity: 1,
      prodPrice: '1200',
      prodImages: ['https://via.placeholder.com/150'],
      selectedColorName: 'Black',
      selectedLensLabel: 'Standard Lens',
      deliveryMethod: 'Pick-up Order',
      paymentMethod: 'Cash',
    ),
    // Add more CompletedOrderCard instances here
  ],
),

    );
  }
}
