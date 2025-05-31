import 'package:flutter/material.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';

class ReadyForPickupOrdersScreen extends StatelessWidget {
  const ReadyForPickupOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Ready for Pickup Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR, 
      body: Center(
        child: CustomText(
          text: 'No orders ready for pick-up.',
          fontSize: 16,
          color: Colors.grey,
        ),
      ),
    );
  }
}
