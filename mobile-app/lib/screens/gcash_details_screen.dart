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
import '../widgets/custom_dialog.dart'; // <-- Import your custom dialogs

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
  bool _isSubmitting = false;

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
    if (_isSubmitting) return;
    if (_pickedFile == null) {
      customDialog(
        context,
        title: "Missing Proof",
        content: "Please upload your payment proof image.",
      );
      return;
    }
    if (_refNumberController.text.isEmpty) {
      customDialog(
        context,
        title: "Missing Reference Number",
        content: "Please enter the reference number.",
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      final token = await AuthStorage.getToken();
      if (token == null) {
        customDialog(
          context,
          title: "Not Logged In",
          content: "Please log in to place your order.",
        );
        setState(() {
          _isSubmitting = false;
        });
        return;
      }

      final file = File(_pickedFile!.path!);
      final url = await StorageService.uploadProofOfPayment(file);

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

      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setInt(
            'cartClearedAt', DateTime.now().millisecondsSinceEpoch);
      } catch (_) {}
    } catch (e) {
      customDialog(
        context,
        title: "Error",
        content: e.toString().replaceFirst('Exception: ', ''),
      );
      setState(() {
        _isSubmitting = false;
      });
      return;
    }

    setState(() {
      _isSubmitting = false;
    });

    // Success Dialog with single "See Orders" button
    customOptionDialog(
      context,
      title: "Thank you!",
      content: "Your order is now pending.",
      yesText: "See Orders", // <-- Change button label
      onYes: () {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => PendingOrdersScreen()),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        backgroundColor: WHITE_COLOR,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'GCASH Payment',
          style: TextStyle(color: BLACK_COLOR, fontWeight: FontWeight.bold),
        ),
        iconTheme: IconThemeData(color: BLACK_COLOR),
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 15.h),
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Payment Info Card
              Card(
                color: Colors.white,
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                margin: EdgeInsets.only(bottom: 25.h),
                child: Padding(
                  padding: EdgeInsets.all(20.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CustomText(
                        text: 'Please pay to the following GCASH account:',
                        fontSize: ScreenUtil().setSp(16),
                        fontWeight: FontWeight.bold,
                      ),
                      SizedBox(height: 15.h),
                      _buildInfoRow('Account Name:', 'Beverly Aniasco'),
                      SizedBox(height: 10.h),
                      _buildInfoRow('GCASH Number:', widget.gcashNumber),
                      SizedBox(height: 10.h),
                      _buildInfoRow('Total Amount to Pay:',
                          widget.totalAmount.toStringAsFixed(2),
                          isAmount: true),
                    ],
                  ),
                ),
              ),

              // QR Code Card
              Card(
                color: Colors.white,
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                margin: EdgeInsets.only(bottom: 25.h),
                child: Padding(
                  padding: EdgeInsets.all(20.w),
                  child: Column(
                    children: [
                      PrettyQr(
                        data: widget.gcashNumber,
                        size: 200.w,
                        roundEdges: true,
                      ),
                      SizedBox(height: 15.h),
                      CustomText(
                        text:
                            'Scan the QR code or pay directly to the GCASH number above.',
                        fontSize: ScreenUtil().setSp(14),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),

              // Payment Proof Card
              Card(
                color: Colors.white,
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Padding(
                  padding: EdgeInsets.all(20.w),
                  child: Column(
                    children: [
                      CustomText(
                        text:
                            'After payment, upload your proof and enter your reference number.',
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
                          fixedSize: Size(double.infinity, 55.h),
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
                                fontSize: ScreenUtil().setSp(14),
                                color: BLACK_COLOR),
                          ),
                        ),
                      SizedBox(height: 20.h),

                      // Reference number input
                      TextField(
                        controller: _refNumberController,
                        decoration: InputDecoration(
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          labelText: 'Enter Reference Number',
                          contentPadding: EdgeInsets.symmetric(
                              horizontal: 15.w, vertical: 15.h),
                        ),
                      ),
                      SizedBox(height: 25.h),

                      // Submit button
                      ElevatedButton(
                        onPressed: _isSubmitting ? null : _submitPaymentProof,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                          minimumSize: Size(double.infinity, 55.h),
                        ),
                        child: _isSubmitting
                            ? Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                          Colors.white),
                                      strokeWidth: 2.5,
                                    ),
                                  ),
                                  SizedBox(width: 12),
                                  CustomText(
                                    text: 'Submitting...',
                                    fontSize: ScreenUtil().setSp(18),
                                    color: Colors.white,
                                  ),
                                ],
                              )
                            : CustomText(
                                text: 'Submit Payment Proof',
                                fontSize: ScreenUtil().setSp(18),
                                color: Colors.white,
                              ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String title, String value, {bool isAmount = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        CustomText(
          text: title,
          fontWeight: FontWeight.bold,
          fontSize: ScreenUtil().setSp(16),
        ),
        CustomText(
          text: value,
          fontSize: ScreenUtil().setSp(16),
          color: isAmount ? BLACK_COLOR : (Colors.grey[800] ?? Colors.grey),
          fontWeight: isAmount ? FontWeight.bold : FontWeight.normal,
        ),
      ],
    );
  }
}
