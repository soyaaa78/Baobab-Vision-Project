import 'package:flutter/material.dart';

class ExpandableOrderCard extends StatefulWidget {
  final String orderId;
  final List<Map<String, dynamic>> products;
  final String deliveryMethod;
  final String thirdPartyDelivery;
  final String status;
  final DateTime? orderDate;
  final VoidCallback? onCancel;
  final Map<String, dynamic>? additionalInfo;

  const ExpandableOrderCard({
    super.key,
    required this.orderId,
    required this.products,
    required this.deliveryMethod,
    required this.thirdPartyDelivery,
    required this.status,
    this.orderDate,
    this.onCancel,
    this.additionalInfo,
  });

  @override
  State<ExpandableOrderCard> createState() => _ExpandableOrderCardState();
}

class _ExpandableOrderCardState extends State<ExpandableOrderCard>
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
                                    widget.orderId,
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
                                      color: _getStatusColor(widget.status),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      _getStatusDisplayText(widget.status),
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              // Show pickupLocation and pickupTime if available
                              if (widget.additionalInfo != null &&
                                  widget.additionalInfo!['pickupLocation'] !=
                                      null &&
                                  (widget.additionalInfo!['pickupLocation']
                                          as String)
                                      .isNotEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 2.0),
                                  child: Row(
                                    children: [
                                      Icon(Icons.location_on,
                                          size: 14, color: Colors.grey[600]),
                                      const SizedBox(width: 4),
                                      Flexible(
                                        child: Text(
                                          widget.additionalInfo![
                                              'pickupLocation'],
                                          style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey[600]),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              if (widget.additionalInfo != null &&
                                  widget.additionalInfo!['pickupTime'] != null)
                                Padding(
                                  padding: const EdgeInsets.only(top: 2.0),
                                  child: Row(
                                    children: [
                                      Icon(Icons.access_time,
                                          size: 14, color: Colors.grey[600]),
                                      const SizedBox(width: 4),
                                      Flexible(
                                        child: Text(
                                          _formatPickupTime(widget
                                              .additionalInfo!['pickupTime']),
                                          style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey[600]),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
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

            // Expandable Product List
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
                    // Action buttons
                    if (widget.onCancel != null ||
                        widget.additionalInfo != null)
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            if (widget.additionalInfo != null) ...[
                              // Additional info like pickup location, time, etc.
                              Expanded(
                                child: _buildAdditionalInfo(),
                              ),
                            ],
                            if (widget.onCancel != null)
                              ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red.shade50,
                                  foregroundColor: Colors.red.shade700,
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 8, horizontal: 14),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  textStyle: const TextStyle(
                                      fontWeight: FontWeight.w600,
                                      fontSize: 14),
                                  elevation: 2,
                                ),
                                onPressed: widget.onCancel,
                                icon:
                                    const Icon(Icons.cancel_outlined, size: 18),
                                label: const Text("Cancel Order"),
                              ),
                          ],
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

  Widget _buildAdditionalInfo() {
    if (widget.additionalInfo == null) return const SizedBox.shrink();

    final info = widget.additionalInfo!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (info['pickupLocation'] != null) ...[
          Row(
            children: [
              Icon(Icons.location_on, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 4),
              Text(
                'Pickup: ${info['pickupLocation']}',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            ],
          ),
          const SizedBox(height: 4),
        ],
        if (info['pickupTime'] != null) ...[
          Row(
            children: [
              Icon(Icons.access_time, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 4),
              Text(
                'Time: ${info['pickupTime']}',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            ],
          ),
          const SizedBox(height: 4),
        ],
        if (info['thirdPartyDelivery'] != null) ...[
          Row(
            children: [
              Icon(Icons.delivery_dining, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 4),
              Text(
                'Delivery: ${info['thirdPartyDelivery']}',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
            ],
          ),
          const SizedBox(height: 4),
        ],
        if (info['cancellationReason'] != null) ...[
          Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: Colors.grey[600]),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  'Reason: ${info['cancellationReason']}',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'processing':
      case 'preparing':
        return Colors.blue;
      case 'ready_to_pickup':
        return Colors.green;
      case 'completed':
        return Colors.green.shade700;
      case 'cancelled':
      case 'cancelled_pending':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _getStatusDisplayText(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'preparing':
        return 'Preparing';
      case 'ready_to_pickup':
        return 'Ready for Pickup';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'cancelled_pending':
        return 'Pending';
      default:
        return status;
    }
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

  String _formatPickupTime(dynamic pickupTime) {
    if (pickupTime == null) return '';
    DateTime? dateTime;
    if (pickupTime is DateTime) {
      dateTime = pickupTime;
    } else if (pickupTime is String) {
      try {
        dateTime = DateTime.tryParse(pickupTime);
      } catch (_) {
        dateTime = null;
      }
    }
    if (dateTime == null) return pickupTime.toString();
    // Format as 'MMM d, yyyy h:mm a'
    final months = [
      '',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    final month = months[dateTime.month];
    final day = dateTime.day;
    final year = dateTime.year;
    int hour = dateTime.hour;
    final minute = dateTime.minute.toString().padLeft(2, '0');
    final ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour == 0) hour = 12;
    return '$month $day, $year $hour:$minute $ampm';
  }
}
