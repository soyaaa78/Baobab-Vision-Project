import 'package:flutter/material.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';

class PendingOrdersScreen extends StatelessWidget {
  const PendingOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Pending Orders'),
        backgroundColor: WHITE_COLOR,
      ),
      backgroundColor: WHITE_COLOR,
      body: Center(
        child: CustomText(
          text: 'No pending orders yet.',
          fontSize: 16,
          color: Colors.grey,
        ),
      ),
    );
  }
}
