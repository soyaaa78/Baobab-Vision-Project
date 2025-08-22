import 'package:flutter/material.dart';
import '../constants.dart';

class ToRateOrderCard extends StatelessWidget {
  final String productId;
  final String prodName;
  final int numStars;
  final int quantity;
  final String prodPrice;
  final List<String> prodImages;
  final String selectedColorName;
  final String selectedLensLabel;
  final String deliveryMethod;
  final String paymentMethod;
  final VoidCallback onRate;

  const ToRateOrderCard({
    super.key,
    required this.productId,
    required this.prodName,
    required this.numStars,
    required this.quantity,
    required this.prodPrice,
    required this.prodImages,
    required this.selectedColorName,
    required this.selectedLensLabel,
    required this.deliveryMethod,
    required this.paymentMethod,
    required this.onRate,
  });

  @override
  Widget build(BuildContext context) {
    final int total = int.tryParse(prodPrice) != null
        ? int.parse(prodPrice) * quantity
        : 0;

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      shadowColor: Colors.black12,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Container(
              height: 100,
              width: 100,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: Colors.grey[200],
                image: prodImages.isNotEmpty
                    ? DecorationImage(
                        image: NetworkImage(prodImages[0]),
                        fit: BoxFit.cover,
                      )
                    : null,
              ),
              child: prodImages.isEmpty
                  ? const Icon(Icons.image_not_supported,
                      size: 40, color: Colors.grey)
                  : null,
            ),

            const SizedBox(width: 16),

            // Product Details Column
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Name
                  Text(
                    prodName,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 17,
                        color: Colors.black87),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 8),

                  // Quantity and Total
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text("Qty: $quantity",
                          style: TextStyle(
                              fontWeight: FontWeight.w500,
                              color: Colors.black54)),
                      Text("₱$total",
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              color: Colors.black87)),
                    ],
                  ),

                  const Divider(height: 18, thickness: 1, color: Colors.grey),

                  // Color & Lens
                  Text(
                    "Color: $selectedColorName",
                    style: TextStyle(
                        fontWeight: FontWeight.w500, color: Colors.black54),
                  ),
                  Text(
                    "Lens: $selectedLensLabel",
                    style: TextStyle(
                        fontWeight: FontWeight.w500, color: Colors.black54),
                  ),

                  const SizedBox(height: 8),

                  // Delivery & Payment
                  Text(
                    deliveryMethod,
                    style: TextStyle(
                        fontStyle: FontStyle.italic, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    "Payment: $paymentMethod",
                    style: TextStyle(
                        fontWeight: FontWeight.w500, color: Colors.black54),
                  ),

                  const SizedBox(height: 12),

                  // Rate Button
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton.icon(
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.green.shade50,
                        foregroundColor: Colors.green.shade700,
                        padding: const EdgeInsets.symmetric(
                            vertical: 6, horizontal: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        textStyle: const TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14),
                      ),
                      onPressed: onRate,
                      icon: const Icon(Icons.star_border, size: 18),
                      label: const Text("Rate Order"),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
