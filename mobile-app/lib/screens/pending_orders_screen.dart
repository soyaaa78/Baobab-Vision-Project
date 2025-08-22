import 'package:flutter/material.dart';
import '../constants.dart';
import '../models/productModel.dart';
import '../widgets/pending_order_card.dart';
import '../widgets/custom_text.dart';

class PendingOrdersScreen extends StatelessWidget {
  const PendingOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> pendingOrders = [
      {
        "productId": "1",
        "prodName": "Stylish Eyewear",
        "prodPrice": "1499", // 👈 no peso sign for calculation
        "numStars": 4,
        "quantity": 1,
        "prodImages": [
          "https://images.unsplash.com/photo-1519682337058-a94d519337bc"
        ],
        "selectedColorName": "Black",
        "selectedLensLabel": "Prescription",
        "deliveryMethod": "Pick-up order",
        "paymentMethod": "Gcash",
      },
      {
        "productId": "2",
        "prodName": "Classic Sunglasses",
        "prodPrice": "999",
        "numStars": 5,
        "quantity": 2,
        "prodImages": [
          "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb"
        ],
        "selectedColorName": "Brown",
        "selectedLensLabel": "Non-prescription",
        "deliveryMethod": "Pick-up order",
        "paymentMethod": "Cash",
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Pending Orders'),
        backgroundColor: WHITE_COLOR,
        foregroundColor: Colors.black,
        elevation: 1,
      ),
      backgroundColor: WHITE_COLOR,
      body: pendingOrders.isEmpty
          ? Center(
              child: CustomText(
                text: 'No pending orders yet.',
                fontSize: 16,
                color: Colors.grey,
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: pendingOrders.length,
              itemBuilder: (context, index) {
                final product = pendingOrders[index];
                return PendingOrderCard(
                  productId: product["productId"] as String,
                  prodName: product["prodName"] as String,
                  prodPrice: product["prodPrice"] as String,
                  numStars: product["numStars"] as int,
                  quantity: product["quantity"] as int,
                  prodImages: product["prodImages"] as List<String>,
                  selectedColorName: product["selectedColorName"] as String,
                  selectedLensLabel: product["selectedLensLabel"] as String,
                  deliveryMethod: product["deliveryMethod"] as String,
                  paymentMethod: product["paymentMethod"] as String,
                  onCancel: () {
  showDialog(
    context: context,
    builder: (context) {
      TextEditingController reasonController = TextEditingController();

      return AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Column(
          children: [
            Icon(Icons.cancel, color: Colors.red, size: 40),
            const SizedBox(height: 8),
            const Text(
              "Are you sure you want to cancel this order?",
              textAlign: TextAlign.center,
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: reasonController,
              maxLines: 3,
              decoration: InputDecoration(
                hintText: "Why do you want to cancel this order?",
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              "* NOTICE: Your request will be solved in 24 hours",
              style: TextStyle(fontSize: 12, color: Colors.black,),
            ),
          ],
        ),
        actionsAlignment: MainAxisAlignment.spaceEvenly,
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // close popup
            },
            style: TextButton.styleFrom(
              backgroundColor: Colors.grey[300],
              minimumSize: const Size(80, 40),
            ),
            child: const Text("NO", style: TextStyle(color: Colors.black)),
          ),
          TextButton(
            onPressed: () {
              // ✅ Require input before submitting
              if (reasonController.text.trim().isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text("Please provide a reason before submitting."),
                    backgroundColor: Colors.red,
                  ),
                );
                return; // stop here
              }

              Navigator.pop(context); // close popup

              // Show success message after submission
              showDialog(
                context: context,
                builder: (context) {
                  return AlertDialog(
                    title: const Text("Request Sent"),
                    content: const Text(
                        "Your cancellation request was sent successfully!"),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text("OK"),
                      ),
                    ],
                  );
                },
              );
            },
            style: TextButton.styleFrom(
              backgroundColor: Colors.black,
              minimumSize: const Size(80, 40),
            ),
            child: const Text("YES", style: TextStyle(color: Colors.white)),
          ),
        ],
      );
    },
  );
},



                );
              },
            ),
    );
  }
}
