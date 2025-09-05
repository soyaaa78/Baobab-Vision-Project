import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../screens/detail_screen.dart';
import 'custom_text.dart';
import '../models/productModel.dart';

// ignore: must_be_immutable
class CustomHorizontalProductCard extends StatefulWidget {
  final String productId;
  final String prodName;
  final String prodPrice;
  final int numStars;
  int quantity;
  final String description;
  final bool isCart;
  final bool isCheckout;
  final List<String> prodImages;
  final List<ColorOption> colorOptions;
  final List<LensOption> lensOptions;
  final String selectedColorName;
  final String selectedLensLabel;
  final String btnName;
  final VoidCallback? onAdd;
  final VoidCallback? onRemove;

  CustomHorizontalProductCard({
    super.key,
    required this.productId,
    required this.prodName,
    required this.prodPrice,
    required this.numStars,
    this.quantity = 1,
    this.description = '',
    this.isCart = false,
    this.isCheckout = false,
    required this.prodImages,
    required this.colorOptions,
    required this.lensOptions,
    required this.selectedColorName,
    required this.selectedLensLabel,
    this.btnName = 'Check Product',
    this.onAdd,
    this.onRemove,
  });

  @override
  State<CustomHorizontalProductCard> createState() =>
      _CustomHorizontalProductCardState();
}

class _CustomHorizontalProductCardState
    extends State<CustomHorizontalProductCard> {
  @override
  Widget build(BuildContext context) {
    return Material(
     elevation: 0, // no shadow
  color: Colors.transparent,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.grey.shade300, // border color
            width: 1, // border width
          ),
        ),
        padding: EdgeInsets.all(ScreenUtil().setWidth(12)),
        margin: EdgeInsets.symmetric(vertical: 6.h),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                widget.prodImages[0],
                width: 90.w,
                height: 90.w,
                fit: BoxFit.cover,
              ),
            ),
            SizedBox(width: 12.w),
            // Product Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Name
                  CustomText(
                    text: widget.prodName,
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w700,
                    color: Colors.black87,
                  ),
                  SizedBox(height: 4.h),
                  // Description
                  Text(
                    'Frame in ${widget.selectedColorName}, ${widget.selectedLensLabel}',
                    style: TextStyle(
                      fontSize: 13.sp,
                      color: Colors.grey[600],
                      height: 1.3,
                    ),
                  ),
                  SizedBox(height: 8.h),
                  // Price & Quantity Controls
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      CustomText(
                        text: widget.prodPrice,
                        fontSize: 15.sp,
                        color: Colors.black87,
                        fontWeight: FontWeight.bold,
                      ),
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.grey[200],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        padding: EdgeInsets.symmetric(horizontal: 6.w, vertical: 4.h),
                        child: Row(
                          children: [
                            GestureDetector(
                              onTap: widget.onRemove,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black12,
                                      blurRadius: 2,
                                    ),
                                  ],
                                ),
                                padding: EdgeInsets.all(4.w),
                                child: Icon(Icons.remove, size: 18, color: BLACK_COLOR),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 10.w),
                              child: CustomText(
                                text: '${widget.quantity}',
                                fontSize: 14.sp,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            GestureDetector(
                              onTap: widget.onAdd,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black12,
                                      blurRadius: 2,
                                    ),
                                  ],
                                ),
                                padding: EdgeInsets.all(4.w),
                                child: Icon(Icons.add, size: 18, color: BLACK_COLOR),
                              ),
                            ),
                          ],
                        ),
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