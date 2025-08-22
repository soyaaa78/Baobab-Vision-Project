import 'package:baobab_vision_project/widgets/processing_order_card.dart';
import 'package:flutter/material.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';

class ProcessingOrdersScreen extends StatelessWidget {
  const ProcessingOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Example dummy order data
    final hasOrders = true; // set true so the card is displayed

    return Scaffold(
      appBar: AppBar(
        title: const Text('Processing Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: hasOrders
          ? ListView(
              padding: const EdgeInsets.all(8),
              children: const [
                ProcessingOrderCard(
                  productId: '1',
                  prodName: 'Stylish Sunglasses',
                  quantity: 2,
                  prodPrice: '1200',
                  prodImages: [
                    'https://images.unsplash.com/photo-1585386959984-a415522c6b48?auto=format&fit=crop&w=100&q=80'
                  ],
                  selectedColorName: 'Black',
                  selectedLensLabel: 'Polarized',
                  deliveryMethod: 'Delivery Order',
                  paymentMethod: 'Gcash',
                ),
                ProcessingOrderCard(
                  productId: '2',
                  prodName: 'Classic Eyeglasses',
                  quantity: 1,
                  prodPrice: '850',
                  prodImages: [
                    'https://images.unsplash.com/photo-1593032465170-8e29d9635a88?auto=format&fit=crop&w=100&q=80'
                  ],
                  selectedColorName: 'Brown',
                  selectedLensLabel: 'Anti-Glare',
                  deliveryMethod: 'Pick-up Order',
                  paymentMethod: 'Cash',
                ),
              ],
            )
          : Center(
              child: CustomText(
                text: 'No orders are being processed currently.',
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
    );
  }
}
