import 'package:flutter/material.dart';
import '../constants.dart';

class PickupOrderCard extends StatelessWidget {
  final String productId;
  final String prodName;
  final int quantity;
  final String prodPrice;
  final List<String> prodImages;
  final String selectedColorName;
  final String selectedLensLabel;
  final String deliveryMethod;
  final String paymentMethod;
  final String pickupLocation;
  final String pickupTime; 

  const PickupOrderCard({
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
    required this.pickupLocation,
    required this.pickupTime,     
  });

  @override
  Widget build(BuildContext context) {
    final int total = int.tryParse(prodPrice) != null
        ? int.parse(prodPrice) * quantity
        : 0;

    return Center(
      child: SizedBox(
        width: MediaQuery.of(context).size.width * 0.90, // 95% of screen width
        child: Card(
          elevation: 3,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          margin: const EdgeInsets.symmetric(vertical: 10),
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
                            fontSize: 17,
                            color: Colors.black87),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),

                      const SizedBox(height: 8),

                      // Quantity & Total
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

                      // Description, Payment, Pickup Info
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
                      const SizedBox(height: 5),
                      Text(
                        "Pickup Location: $pickupLocation",
                        style: TextStyle(
                            fontWeight: FontWeight.w500, color: Colors.black54),
                      ),
                      Text(
                        "Pickup Time: $pickupTime",
                        style: TextStyle(
                            fontWeight: FontWeight.w500, color: Colors.black54),
                      ),

                      const SizedBox(height: 8),

                      // Ready for Pickup Status
                      Row(
                        children: const [
                          Icon(Icons.check_circle, size: 18, color: Colors.green),
                          SizedBox(width: 6),
                          Text(
                            "Ready for Pickup",
                            style: TextStyle(
                                fontWeight: FontWeight.bold, color: Colors.green),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}