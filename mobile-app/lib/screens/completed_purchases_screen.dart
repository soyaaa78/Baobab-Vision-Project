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
      body: Center(
        child: CustomText(
          text: 'No completed purchases yet.',
          fontSize: 16,
          color: Colors.grey,
        ),
      ),
    );
  }
}
