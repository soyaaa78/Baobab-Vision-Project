import 'package:flutter/material.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';

class ProcessingOrdersScreen extends StatelessWidget {
  const ProcessingOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Processing Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: Center(
        child: CustomText(
          text: 'No orders are being processed currently.',
          fontSize: 16,
          color: Colors.grey,
        ),
      ),
    );
  }
}
