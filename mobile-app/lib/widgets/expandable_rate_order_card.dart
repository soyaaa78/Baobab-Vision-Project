import 'package:flutter/material.dart';
import '../screens/rate_input_screen.dart';

class ExpandableRateOrderCard extends StatefulWidget {
  final String orderId;
  final String backendOrderId;
  final List<Map<String, dynamic>> products;
  final String deliveryMethod;
  final String thirdPartyDelivery;
  final String status;
  final DateTime? orderDate;
  final VoidCallback? onRated;

  const ExpandableRateOrderCard({
    super.key,
    required this.orderId,
    required this.backendOrderId,
    required this.products,
    required this.deliveryMethod,
    required this.thirdPartyDelivery,
    required this.status,
    this.orderDate,
    this.onRated,
  });

  @override
  State<ExpandableRateOrderCard> createState() =>
      _ExpandableRateOrderCardState();
}

class _ExpandableRateOrderCardState extends State<ExpandableRateOrderCard>
    with SingleTickerProviderStateMixin {
  bool _isExpanded = false;
  late AnimationController _animationController;
  late Animation<double> _iconRotationAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _iconRotationAnimation = Tween<double>(
      begin: 0.0,
      end: 0.5,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleExpansion() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _animationController.forward();
      } else {
        _animationController.reverse();
      }
    });
  }

  double get _totalAmount {
    return widget.products.fold(0.0, (sum, product) {
      final price =
          double.tryParse(product['prodPrice']?.toString() ?? '0') ?? 0.0;
      final quantity = product['quantity'] ?? 1;
      return sum + (price * quantity);
    });
  }

  int get _totalItems {
    return widget.products.fold(0, (sum, product) {
      return sum + (product['quantity'] ?? 1) as int;
    });
  }

  String get _primaryProductName {
    if (widget.products.isEmpty) return '';
    return widget.products.first['prodName']?.toString() ?? '';
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 6,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
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
        child: Column(
          children: [
            // Order Header - Always Visible
            InkWell(
              onTap: _toggleExpansion,
              borderRadius: BorderRadius.circular(20),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      children: [
                        // Order ID and Status
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    'Order #${widget.orderId}',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                      color: Colors.black87,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.green.shade700,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Text(
                                      'Completed',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              if (widget.orderDate != null)
                                Text(
                                  _formatDate(widget.orderDate!),
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                            ],
                          ),
                        ),
                        // Expand/Collapse Icon
                        AnimatedBuilder(
                          animation: _iconRotationAnimation,
                          builder: (context, child) {
                            return Transform.rotate(
                              angle: _iconRotationAnimation.value * 3.14159,
                              child: Icon(
                                Icons.expand_more,
                                size: 24,
                                color: Colors.grey[600],
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    // Order Summary
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '$_totalItems item${_totalItems > 1 ? 's' : ''}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[700],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        Text(
                          '₱${_totalAmount.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(Icons.local_shipping,
                            size: 16, color: Colors.grey[600]),
                        const SizedBox(width: 4),
                        Text(
                          widget.deliveryMethod,
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                        ),
                        if (widget.thirdPartyDelivery.isNotEmpty) ...[
                          const SizedBox(width: 16),
                          Icon(Icons.delivery_dining,
                              size: 16, color: Colors.grey[600]),
                          const SizedBox(width: 4),
                          Text(
                            widget.thirdPartyDelivery,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Expandable Product List and Rate Button
            AnimatedCrossFade(
              duration: const Duration(milliseconds: 300),
              crossFadeState: _isExpanded
                  ? CrossFadeState.showSecond
                  : CrossFadeState.showFirst,
              firstChild: const SizedBox.shrink(),
              secondChild: Container(
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(20),
                    bottomRight: Radius.circular(20),
                  ),
                ),
                child: Column(
                  children: [
                    const Divider(height: 1, thickness: 1),
                    ...widget.products
                        .map((product) => _buildProductItem(product)),
                    // Rate Button
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 3,
                          ),
                          onPressed: () async {
                            await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => RateInputScreen(
                                  productName: _primaryProductName,
                                  orderId: widget.backendOrderId,
                                ),
                              ),
                            );
                            if (widget.onRated != null) {
                              widget.onRated!();
                            }
                          },
                          icon: const Icon(Icons.star_rate, size: 20),
                          label: const Text(
                            'Rate This Order',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductItem(Map<String, dynamic> product) {
    final prodImages = List<String>.from(product['prodImages'] ?? []);
    final prodName = product['prodName']?.toString() ?? '';
    final quantity = product['quantity'] ?? 1;
    final prodPrice = product['prodPrice']?.toString() ?? '';
    final selectedColorName = product['selectedColorName']?.toString() ?? '';
    final selectedLensLabel = product['selectedLensLabel']?.toString() ?? '';

    final total = (double.tryParse(prodPrice) ?? 0.0) * quantity;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Image
          Container(
            height: 60,
            width: 60,
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
                ? Icon(Icons.image_not_supported,
                    size: 24, color: Colors.grey[500])
                : null,
          ),

          const SizedBox(width: 12),

          // Product Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  prodName,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    color: Colors.black87,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                if (selectedColorName.isNotEmpty)
                  Text(
                    'Color: $selectedColorName',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                if (selectedLensLabel.isNotEmpty)
                  Text(
                    'Lens: $selectedLensLabel',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Qty: $quantity',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey[700],
                      ),
                    ),
                    Text(
                      '₱${total.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date).inDays;

    if (difference == 0) {
      return 'Today';
    } else if (difference == 1) {
      return 'Yesterday';
    } else if (difference < 7) {
      return '$difference days ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}
