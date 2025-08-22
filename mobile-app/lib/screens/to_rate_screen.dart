import 'package:baobab_vision_project/screens/rate_input_screen.dart';
import 'package:baobab_vision_project/widgets/to_rate_order_card.dart';
import 'package:flutter/material.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';

class ToRateScreen extends StatelessWidget {
  const ToRateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('To Rate Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR, 
      body: ListView(
  padding: const EdgeInsets.all(8),
  children: [
    ToRateOrderCard(
      productId: "1",
      prodName: "Classic Black Glasses",
      numStars: 0,
      quantity: 1,
      prodPrice: "1200",
      prodImages: ["https://example.com/image.jpg"],
      selectedColorName: "Black",
      selectedLensLabel: "Clear",
      deliveryMethod: "Delivery: Standard",
      paymentMethod: "Cash on Delivery",
      onRate: () {
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (_) => RateInputScreen(productName: "Classic Black Glasses"),
    ),
  );
},

    ),
    // add more cards here
  ],
),

    );
  }
}
