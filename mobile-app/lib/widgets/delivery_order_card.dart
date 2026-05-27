import 'package:flutter/material.dart';
import '../constants.dart';

class DeliveryOrderCard extends StatelessWidget {
  final String productId;
  final String prodName;
  final int quantity;
  final String prodPrice;
  final List<String> prodImages;
  final String selectedColorName;
  final String selectedLensLabel;
  final String deliveryMethod;
  final String paymentMethod;
  final String deliveryStatus; // e.g., Picked Up, In Transit, Delivered
  final String? thirdPartyDelivery; // e.g., Lalamove, J&T Express

  const DeliveryOrderCard({
    super.key,
    required this.productId,
    required this.prodName,
    required this.quantity,
    required this.prodPrice,
    required this.prodImages,
    required this.selectedColorName,
    required this.selectedLensLabel,
    required this.deliveryMethod,
    required this.paymentMethod,
    required this.deliveryStatus,
    this.thirdPartyDelivery,
  });

  @override
  Widget build(BuildContext context) {
    final int total =
        int.tryParse(prodPrice) != null ? int.parse(prodPrice) * quantity : 0;

    // Choose color based on delivery status
    Color statusColor;
    switch (deliveryStatus.toLowerCase()) {
      case 'delivered':
        statusColor = Colors.green;
        break;
      case 'in transit':
        statusColor = Colors.orange;
        break;
      case 'picked up':
        statusColor = Colors.blue;
        break;
      case 'delayed':
        statusColor = Colors.red;
        break;
      default:
        statusColor = Colors.grey;
    }

    return Card(
      elevation: 5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
      shadowColor: Colors.black26,
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.white, Colors.grey.shade50],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Container(
              height: 110,
              width: 110,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: Colors.grey[200],
                image: prodImages.isNotEmpty
                    ? DecorationImage(
                        image: NetworkImage(prodImages[0]),
                        fit: BoxFit.cover,
                      )
                    : null,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 6,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: prodImages.isEmpty
                  ? const Icon(Icons.image_not_supported,
                      size: 40, color: Colors.grey)
                  : null,
            ),

            const SizedBox(width: 18),

            // Product Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Name
                  Text(
                    prodName,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: Colors.black87),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  const SizedBox(height: 8),

                  // Quantity & Total
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Qty: $quantity",
                        style: TextStyle(
                            fontWeight: FontWeight.w500,
                            color: Colors.grey[700]),
                      ),
                      Text(
                        "₱$total",
                        style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: Colors.black87),
                      ),
                    ],
                  ),

                  const Divider(height: 20, thickness: 1, color: Colors.grey),

                  // Color
                  Text(
                    "Color: $selectedColorName",
                    style: TextStyle(
                        fontWeight: FontWeight.w500, color: Colors.grey[700]),
                  ),

                  const SizedBox(height: 4),

                  // Lens
                  Text(
                    "Lens: $selectedLensLabel",
                    style: TextStyle(
                        fontWeight: FontWeight.w500, color: Colors.grey[700]),
                  ),

                  const SizedBox(height: 8),

                  // Delivery & Payment
                  (thirdPartyDelivery != null && thirdPartyDelivery!.isNotEmpty)
                      ? Container(
                          padding: const EdgeInsets.symmetric(
                              vertical: 3, horizontal: 8),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.blue.shade200),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.local_shipping,
                                  size: 14, color: Colors.blue),
                              const SizedBox(width: 4),
                              Text(
                                thirdPartyDelivery!,
                                style: const TextStyle(
                                    fontSize: 12, color: Colors.blue),
                              ),
                            ],
                          ),
                        )
                      : Text(
                          deliveryMethod,
                          style: TextStyle(
                              fontStyle: FontStyle.italic,
                              color: Colors.grey[600]),
                        ),

                  const SizedBox(height: 2),
                  Text(
                    "Payment: $paymentMethod",
                    style: TextStyle(
                        fontWeight: FontWeight.w500, color: Colors.grey[800]),
                  ),

                  const SizedBox(height: 8),

                  // Delivery Status
                  Row(
                    children: [
                      Icon(Icons.local_shipping, size: 18, color: statusColor),
                      const SizedBox(width: 6),
                      Text(
                        deliveryStatus,
                        style: TextStyle(
                            fontWeight: FontWeight.bold, color: statusColor),
                      ),
                    ],
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