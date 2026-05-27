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
    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxWidth < 360;
        final borderRadius = BorderRadius.circular(20);
        final headerPadding = EdgeInsets.all(isCompact ? 12 : 16);
        final summarySpacing = isCompact ? 8.0 : 12.0;

        return Card(
          elevation: 6,
          shape: RoundedRectangleBorder(
            borderRadius: borderRadius,
          ),
          margin: EdgeInsets.symmetric(
            vertical: 8,
            horizontal: isCompact ? 8 : 12,
          ),
          shadowColor: Colors.black26,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.white, Colors.grey.shade50],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: borderRadius,
            ),
            child: Column(
              children: [
                InkWell(
                  onTap: _toggleExpansion,
                  borderRadius: borderRadius,
                  child: Padding(
                    padding: headerPadding,
                    child: Column(
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.orderId,
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: isCompact ? 14 : 16,
                                      color: Colors.black87,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  SizedBox(height: isCompact ? 4 : 6),
                                  Align(
                                    alignment: Alignment.centerLeft,
                                    child: Container(
                                      padding: EdgeInsets.symmetric(
                                        horizontal: isCompact ? 6 : 8,
                                        vertical: isCompact ? 2 : 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: _getStatusColor(widget.status),
                                        borderRadius:
                                            BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        _getStatusDisplayText(widget.status),
                                        style: TextStyle(
                                          fontSize: isCompact ? 11 : 12,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.white,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: isCompact ? 4 : 6),
                                  if (widget.additionalInfo != null &&
                                      widget.additionalInfo![
                                              'pickupLocation'] !=
                                          null &&
                                      (widget.additionalInfo!['pickupLocation']
                                              as String)
                                          .isNotEmpty)
                                    _buildIconTextRow(
                                      Icons.location_on,
                                      widget.additionalInfo!['pickupLocation'],
                                      isCompact,
                                    ),
                                  if (widget.additionalInfo != null &&
                                      widget.additionalInfo!['pickupTime'] !=
                                          null)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 4),
                                      child: _buildIconTextRow(
                                        Icons.access_time,
                                        _formatPickupTime(
                                          widget.additionalInfo!['pickupTime'],
                                        ),
                                        isCompact,
                                      ),
                                    ),
                                  if (widget.orderDate != null)
                                    Padding(
                                      padding: EdgeInsets.only(
                                          top: isCompact ? 4 : 6),
                                      child: Text(
                                        _formatDate(widget.orderDate!),
                                        style: TextStyle(
                                          fontSize: isCompact ? 11 : 12,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
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
                        SizedBox(height: summarySpacing),
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                '$_totalItems item${_totalItems > 1 ? 's' : ''}',
                                style: TextStyle(
                                  fontSize: isCompact ? 13 : 14,
                                  color: Colors.grey[700],
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Flexible(
                              child: Text(
                                '₱${_totalAmount.toStringAsFixed(2)}',
                                style: TextStyle(
                                  fontSize: isCompact ? 15 : 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black87,
                                ),
                                textAlign: TextAlign.end,
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: isCompact ? 6 : 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildIconTextRow(
                              Icons.local_shipping,
                              widget.deliveryMethod,
                              isCompact,
                              maxLines: 2,
                            ),
                            if (widget.thirdPartyDelivery.isNotEmpty)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: _buildIconTextRow(
                                  Icons.delivery_dining,
                                  widget.thirdPartyDelivery,
                                  isCompact,
                                  maxLines: 2,
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
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
                        ...widget.products.map(
                            (product) => _buildProductItem(product, isCompact)),
                        if (widget.onCancel != null ||
                            widget.additionalInfo != null)
                          Padding(
                            padding: EdgeInsets.all(isCompact ? 12 : 16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (widget.additionalInfo != null)
                                  _buildAdditionalInfo(isCompact),
                                if (widget.additionalInfo != null &&
                                    widget.onCancel != null)
                                  SizedBox(height: isCompact ? 12 : 16),
                                if (widget.onCancel != null)
                                  Align(
                                    alignment: isCompact
                                        ? Alignment.center
                                        : Alignment.centerRight,
                                    child: SizedBox(
                                      width: isCompact ? double.infinity : null,
                                      child: ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.red.shade50,
                                          foregroundColor: Colors.red.shade700,
                                          padding: EdgeInsets.symmetric(
                                            vertical: isCompact ? 8 : 10,
                                            horizontal: isCompact ? 12 : 14,
                                          ),
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(10),
                                          ),
                                          textStyle: TextStyle(
                                            fontWeight: FontWeight.w600,
                                            fontSize: isCompact ? 13 : 14,
                                          ),
                                          elevation: 2,
                                        ),
                                        onPressed: widget.onCancel,
                                        icon: Icon(
                                          Icons.cancel_outlined,
                                          size: isCompact ? 18 : 20,
                                        ),
                                        label: const Text('Cancel Order'),
                                      ),
                                    ),
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
      },
    );
  }

  Widget _buildProductItem(Map<String, dynamic> product, bool isCompact) {
    final prodImages = List<String>.from(product['prodImages'] ?? []);
    final prodName = product['prodName']?.toString() ?? '';
    final quantity = product['quantity'] ?? 1;
    final prodPrice = product['prodPrice']?.toString() ?? '';
    final selectedColorName = product['selectedColorName']?.toString() ?? '';
    final selectedLensLabel = product['selectedLensLabel']?.toString() ?? '';

    final total = (double.tryParse(prodPrice) ?? 0.0) * quantity;

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 12 : 16,
        vertical: isCompact ? 10 : 12,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Product Image
          Container(
            height: isCompact ? 52 : 60,
            width: isCompact ? 52 : 60,
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

          SizedBox(width: isCompact ? 10 : 12),

          // Product Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  prodName,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: isCompact ? 13 : 14,
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
                      fontSize: isCompact ? 11 : 12,
                      color: Colors.grey[600],
                    ),
                  ),
                if (selectedLensLabel.isNotEmpty)
                  Text(
                    'Lens: $selectedLensLabel',
                    style: TextStyle(
                      fontSize: isCompact ? 11 : 12,
                      color: Colors.grey[600],
                    ),
                  ),
                SizedBox(height: isCompact ? 4 : 6),
                Row(
                  children: [
                    Text(
                      'Qty: $quantity',
                      style: TextStyle(
                        fontSize: isCompact ? 11 : 12,
                        fontWeight: FontWeight.w500,
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        '₱${total.toStringAsFixed(2)}',
                        style: TextStyle(
                          fontSize: isCompact ? 13 : 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                        textAlign: TextAlign.end,
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

  Widget _buildAdditionalInfo(bool isCompact) {
    if (widget.additionalInfo == null) return const SizedBox.shrink();

    final info = widget.additionalInfo!;
    final spacing = isCompact ? 6.0 : 8.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (info['pickupLocation'] != null)
          Padding(
            padding: EdgeInsets.only(bottom: spacing),
            child: _buildIconTextRow(
              Icons.location_on,
              'Pickup: ${info['pickupLocation']}',
              isCompact,
              maxLines: 2,
            ),
          ),
        if (info['pickupTime'] != null)
          Padding(
            padding: EdgeInsets.only(bottom: spacing),
            child: _buildIconTextRow(
              Icons.access_time,
              'Time: ${_formatPickupTime(info['pickupTime'])}',
              isCompact,
              maxLines: 2,
            ),
          ),
        if (info['thirdPartyDelivery'] != null)
          Padding(
            padding: EdgeInsets.only(bottom: spacing),
            child: _buildIconTextRow(
              Icons.delivery_dining,
              'Delivery: ${info['thirdPartyDelivery']}',
              isCompact,
              maxLines: 2,
            ),
          ),
        if (info['cancellationReason'] != null)
          _buildIconTextRow(
            Icons.info_outline,
            'Reason: ${info['cancellationReason']}',
            isCompact,
            maxLines: 3,
          ),
      ],
    );
  }

  Widget _buildIconTextRow(
    IconData icon,
    String text,
    bool isCompact, {
    int maxLines = 2,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: isCompact ? 14 : 16,
          color: Colors.grey[600],
        ),
        SizedBox(width: isCompact ? 4 : 6),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              fontSize: isCompact ? 11 : 12,
              color: Colors.grey[600],
            ),
            maxLines: maxLines,
            overflow: TextOverflow.ellipsis,
          ),
        ),
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
      case 'ready_for_shipment':
        return Colors.deepPurple;
      case 'in_transit':
        return Colors.indigo;
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
      case 'ready_for_shipment':
        return 'For Shipment';
      case 'in_transit':
        return 'In Transit';
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
