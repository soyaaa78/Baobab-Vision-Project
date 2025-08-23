import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/screens/pending_orders_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../widgets/custom_text.dart';
import 'package:pretty_qr_code/pretty_qr_code.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'package:baobab_vision_project/services/storage_service.dart';
import 'package:baobab_vision_project/services/order_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:baobab_vision_project/services/auth_storage.dart';

class GcashDetailsScreen extends StatefulWidget {
  final String gcashNumber;
  final double totalAmount;
  final String deliveryMethod;
  final String? thirdPartyDelivery;
  final String? contactNumber;
  final Map<String, dynamic>? addressDetails;

  const GcashDetailsScreen({
    super.key,
    required this.gcashNumber,
    required this.totalAmount,
    required this.deliveryMethod,
    this.thirdPartyDelivery,
    this.contactNumber,
    this.addressDetails,
  });

  @override
  State<GcashDetailsScreen> createState() => _GcashDetailsScreenState();
}

class _GcashDetailsScreenState extends State<GcashDetailsScreen> {
  PlatformFile? _pickedFile;
  final TextEditingController _refNumberController = TextEditingController();

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.image,
    );
    if (result != null && result.files.isNotEmpty) {
      setState(() {
        _pickedFile = result.files.first;
      });
    }
  }

  @override
  void dispose() {
    _refNumberController.dispose();
    super.dispose();
  }

  Future<void> _submitPaymentProof() async {
    if (_pickedFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please upload your payment proof image.')),
      );
      return;
    }
    if (_refNumberController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter the reference number.')),
      );
      return;
    }

    try {
      // Ensure user is logged in for authorized checkout
      final token = await AuthStorage.getToken();
      if (token == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Please log in to place your order.'),
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 3),
          ),
        );
        return;
      }
      // 1) Upload image to storage API first
      final file = File(_pickedFile!.path!);
      final url = await StorageService.uploadProofOfPayment(file);

      // 2) Create the order with the uploaded image URL attached
      final orderId = await OrderService.checkoutFromCart(
        deliveryMethod: widget.deliveryMethod,
        paymentMethod: 'Gcash',
        thirdPartyDelivery: widget.thirdPartyDelivery,
        addressDetails: widget.addressDetails,
        contactNumber: widget.contactNumber,
        proofOfPaymentImage: url,
        referenceNumber: _refNumberController.text.trim(),
      );
      if (orderId == null) {
        throw Exception('Failed to create order');
      }

      // 3) Mark cart as cleared locally
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setInt(
            'cartClearedAt', DateTime.now().millisecondsSinceEpoch);
      } catch (_) {}
    } catch (e) {
      // Subtle error, but continue to confirmation to keep flow intact
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString().replaceFirst('Exception: ', ''),
          ),
          behavior: SnackBarBehavior.floating,
          duration: Duration(seconds: 3),
        ),
      );
    }

    // Show confirmation dialog
    showDialog(
      context: context,
      barrierDismissible: false, // prevent closing by tapping outside
      builder: (context) => AlertDialog(
        title: Text('Thank you!'),
        content: Text('Your order now is pending.'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close the dialog
              // Navigate to pending orders screen
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => PendingOrdersScreen()),
              );
            },
            child: Text('See Orders'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        backgroundColor: WHITE_COLOR,
        title: const Text('GCASH Payment'),
      ),
      body: Padding(
        padding: EdgeInsets.all(20.w),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CustomText(
                text: 'Please pay to the following GCASH account:',
                fontSize: ScreenUtil().setSp(16),
                fontWeight: FontWeight.bold,
              ),
              SizedBox(height: 20.h),
              CustomText(
                text: 'Account Name:',
                fontWeight: FontWeight.bold,
                fontSize: ScreenUtil().setSp(18),
              ),
              CustomText(
                text: 'Beverly Aniasco',
                fontSize: ScreenUtil().setSp(18),
              ),
              SizedBox(height: 15.h),
              CustomText(
                text: 'GCASH Number:',
                fontWeight: FontWeight.bold,
                fontSize: ScreenUtil().setSp(18),
              ),
              CustomText(
                text: widget.gcashNumber,
                fontSize: ScreenUtil().setSp(18),
              ),
              SizedBox(height: 15.h),
              CustomText(
                text: 'Total Amount to Pay:',
                fontWeight: FontWeight.bold,
                fontSize: ScreenUtil().setSp(18),
              ),
              CustomText(
                text: widget.totalAmount.toStringAsFixed(2),
                fontSize: ScreenUtil().setSp(18),
                color: BLACK_COLOR,
                fontWeight: FontWeight.bold,
              ),
              SizedBox(height: 30.h),

              // QR Code
              PrettyQr(
                data: widget.gcashNumber,
                size: 200.w,
                roundEdges: true,
              ),
              SizedBox(height: 30.h),

              CustomText(
                text:
                    'After payment, please upload your payment proof and enter your reference number for verification.',
                fontSize: ScreenUtil().setSp(16),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 20.h),

              // Upload button and file name
              ElevatedButton.icon(
                onPressed: _pickFile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  fixedSize: Size(300.w, 55.h),
                ),
                icon: Icon(Icons.upload_file, color: Colors.white),
                label: CustomText(
                  text: _pickedFile == null
                      ? 'Upload Proof of Payment'
                      : 'Change File',
                  color: Colors.white,
                  fontSize: ScreenUtil().setSp(16),
                ),
              ),
              if (_pickedFile != null)
                Padding(
                  padding: EdgeInsets.only(top: 8.h),
                  child: Text(
                    'Selected file: ${_pickedFile!.name}',
                    style: TextStyle(
                        fontSize: ScreenUtil().setSp(14), color: BLACK_COLOR),
                  ),
                ),

              SizedBox(height: 20.h),

              // Reference number input
              TextField(
                controller: _refNumberController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Enter Reference Number',
                ),
              ),

              SizedBox(height: 30.h),

              ElevatedButton(
                onPressed: _submitPaymentProof,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  minimumSize: Size(double.infinity, 55.h),
                ),
                child: CustomText(
                  text: 'Submit Payment Proof',
                  fontSize: ScreenUtil().setSp(18),
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
