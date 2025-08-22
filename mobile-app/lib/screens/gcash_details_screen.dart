import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/screens/pending_orders_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../widgets/custom_text.dart';
import 'package:pretty_qr_code/pretty_qr_code.dart';
import 'package:file_picker/file_picker.dart';

class GcashDetailsScreen extends StatefulWidget {
  final String gcashNumber;
  final double totalAmount;

  const GcashDetailsScreen({
    super.key,
    required this.gcashNumber,
    required this.totalAmount,
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

  void _submitPaymentProof() {
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

  // TODO: Handle the uploaded file and reference number (e.g., upload to server)

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
    text: _pickedFile == null ? 'Upload Proof of Payment' : 'Change File',
    color: Colors.white,
    fontSize: ScreenUtil().setSp(16),
  ),
),
              if (_pickedFile != null)
                Padding(
                  padding: EdgeInsets.only(top: 8.h),
                  child: Text(
                    'Selected file: ${_pickedFile!.name}',
                    style: TextStyle(fontSize: ScreenUtil().setSp(14), color: BLACK_COLOR),
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