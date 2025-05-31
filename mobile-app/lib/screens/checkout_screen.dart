import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';

class CheckoutScreen extends StatefulWidget {
  final double totalAmount;

  const CheckoutScreen({super.key, required this.totalAmount});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String selectedPaymentMethod = 'GCASH';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        backgroundColor: WHITE_COLOR,
        elevation: 0,
        leading: BackButton(color: Colors.black),
        title: CustomText(
          text: 'Checkout',
          fontSize: ScreenUtil().setSp(25),
          fontWeight: FontWeight.bold,
          color: Colors.black,
        ),
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 30.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CustomText(
              text: 'Payment Method',
              fontSize: ScreenUtil().setSp(20),
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
            SizedBox(height: 15.h),

            // Payment method card for GCASH with overflow fix
            GestureDetector(
              onTap: () {
                setState(() {
                  selectedPaymentMethod = 'GCASH';
                });
              },
              child: Container(
                padding: EdgeInsets.all(15.sp),
                decoration: BoxDecoration(
                  color: selectedPaymentMethod == 'GCASH' ? Colors.black : Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  border: Border.all(
                    color: selectedPaymentMethod == 'GCASH' ? Colors.black : Colors.grey.shade300,
                    width: 2,
                  ),
                  boxShadow: [
                    if (selectedPaymentMethod == 'GCASH')
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      )
                  ],
                ),
                child: Row(
                  children: [
                    SizedBox(
                      width: 40.w,
                      height: 40.h,
                      child: Image.asset(
                        'assets/images/gcash.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                    SizedBox(width: 15.w),
                    Expanded(
                      child: CustomText(
                        text: 'GCASH',
                        fontSize: ScreenUtil().setSp(18),
                        fontWeight: FontWeight.bold,
                        color: selectedPaymentMethod == 'GCASH' ? Colors.white : Colors.black,
                        maxLines: 1, 
                      ),
                    ),
                    if (selectedPaymentMethod == 'GCASH')
                      Icon(Icons.check_circle, color: Colors.green, size: 24.sp),
                  ],
                ),
              ),
            ),

            Spacer(),

            // Total amount display
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                CustomText(
                  text: 'Total:',
                  fontSize: ScreenUtil().setSp(20),
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
                CustomText(
                  text: 'PHP ${widget.totalAmount.toStringAsFixed(2)}',
                  fontSize: ScreenUtil().setSp(20),
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ],
            ),
            SizedBox(height: 25.h),

            // Pay Now button
            SizedBox(
              width: double.infinity,
              height: 55.h,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Implement payment logic or navigate to payment processing
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: CustomText(
                  text: 'Pay Now',
                  fontSize: ScreenUtil().setSp(18),
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
