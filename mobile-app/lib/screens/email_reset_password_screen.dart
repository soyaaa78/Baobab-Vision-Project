import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;

import '../constants.dart';
import '../widgets/custom_dialog.dart';
import '../widgets/custom_inkwell_button.dart';
import 'reset_password_screen.dart';

class EmailResetPasswordScreen extends StatefulWidget {
  final String email;

  const EmailResetPasswordScreen({super.key, required this.email});

  @override
  State<EmailResetPasswordScreen> createState() => _EmailResetPasswordScreenState();
}

class _EmailResetPasswordScreenState extends State<EmailResetPasswordScreen> {
  final TextEditingController otpController = TextEditingController();
  bool isLoading = false;

  Future<void> verifyOtp() async {
    setState(() => isLoading = true);
    final url = Uri.parse('http://10.0.2.2:3001/authRoutes/verify-otp');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': widget.email,
          'otp': otpController.text.trim(),
        }),
      );

      print('VERIFY OTP RESPONSE CODE: ${response.statusCode}');
      print('VERIFY OTP RESPONSE BODY: ${response.body}');

      if (response.statusCode == 200) {
        final resData = jsonDecode(response.body);
        final resetToken = resData['resetToken'];

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => ResetPasswordScreen(
              email: widget.email,
              token: resetToken,
            ),
          ),
        );
      } else {
        final resData = jsonDecode(response.body);
        customDialog(context, title: 'Invalid OTP', content: resData['message'] ?? 'OTP error');
      }
    } catch (e) {
      print('VERIFY OTP EXCEPTION: $e');
      customDialog(context, title: 'Error', content: 'Failed to verify. Check your network or try again.');
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> resendOtp() async {
    final url = Uri.parse('http://10.0.2.2:3001/authRoutes/resend-otp');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': widget.email}),
      );

      print('RESEND OTP RESPONSE: ${response.body}');
      customDialog(context, title: 'OTP Sent', content: 'A new OTP has been sent to your email.');
    } catch (e) {
      print('RESEND OTP ERROR: $e');
      customDialog(context, title: 'Error', content: 'Failed to resend OTP');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        title: const Text('Verify Your Email'),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Theme.of(context).primaryColor,
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 30.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Check your email',
              style: TextStyle(fontSize: 22.sp, fontWeight: FontWeight.w600),
            ),
            SizedBox(height: 10.h),
            Text(
              'We’ve sent an OTP to:',
              style: TextStyle(fontSize: 14.sp, color: Colors.grey[700]),
            ),
            Text(
              widget.email,
              style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w500, color: BLACK_COLOR),
            ),
            SizedBox(height: 30.h),

            /// OTP Input
            TextFormField(
              controller: otpController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Enter OTP',
                prefixIcon: const Icon(Icons.lock_outline),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.r)),
              ),
            ),
            SizedBox(height: 30.h),

            /// Verify Button
            CustomInkwellButton(
              onTap: verifyOtp,
              height: 50.h,
              width: double.infinity,
              buttonName: isLoading ? 'Verifying...' : 'Verify OTP',
              fontSize: 16.sp,
            ),
            SizedBox(height: 16.h),

            /// Resend Button
            Center(
              child: TextButton(
                onPressed: resendOtp,
                child: Text(
                  'Didn’t get the code? Resend OTP',
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: Theme.of(context).primaryColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
