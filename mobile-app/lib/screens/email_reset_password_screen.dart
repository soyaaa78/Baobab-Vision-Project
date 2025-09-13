import 'dart:async';
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
  State<EmailResetPasswordScreen> createState() =>
      _EmailResetPasswordScreenState();
}

class _EmailResetPasswordScreenState extends State<EmailResetPasswordScreen> {
  final TextEditingController otpController = TextEditingController();
  bool isLoading = false;

  /// Countdown
  int secondsRemaining = 300; // 5 minutes = 300 seconds
  Timer? timer;

  @override
  void initState() {
    super.initState();
    startTimer();
  }

  @override
  void dispose() {
    timer?.cancel();
    otpController.dispose();
    super.dispose();
  }

  void startTimer() {
    timer?.cancel();
    setState(() {
      secondsRemaining = 300;
    });
    timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (secondsRemaining > 0) {
        setState(() {
          secondsRemaining--;
        });
      } else {
        t.cancel();
      }
    });
  }

  Future<void> verifyOtp() async {
    setState(() => isLoading = true);
    final url = Uri.parse(
        'https://baobab-vision-project-peox.onrender.com/api/auth/verify-otp');

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
        customDialog(context,
            title: 'Invalid OTP', content: resData['message'] ?? 'OTP error');
      }
    } catch (e) {
      print('VERIFY OTP EXCEPTION: $e');
      customDialog(context,
          title: 'Error',
          content: 'Failed to verify. Check your network or try again.');
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> resendOtp() async {
    final url = Uri.parse(
        'https://baobab-vision-project-peox.onrender.com/api/auth/resend-otp');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': widget.email}),
      );

      print('RESEND OTP RESPONSE: ${response.body}');
      customDialog(context,
          title: 'OTP Sent', content: 'A new OTP has been sent to your email.');

      /// Restart timer when resend
      startTimer();
    } catch (e) {
      print('RESEND OTP ERROR: $e');
      customDialog(context, title: 'Error', content: 'Failed to resend OTP');
    }
  }

  String formatTime(int seconds) {
    final minutes = (seconds ~/ 60).toString().padLeft(2, '0');
    final secs = (seconds % 60).toString().padLeft(2, '0');
    return "$minutes:$secs";
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        backgroundColor: WHITE_COLOR,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'Verify Your Email',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 32.h),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            /// Icon Header
            Icon(
              Icons.mark_email_read_outlined,
              size: 80.sp,
              color: Colors.blueAccent,
            ),
            SizedBox(height: 20.h),

            /// Title
            Text(
              'Check Your Email',
              style: TextStyle(
                fontSize: 22.sp,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 10.h),

            /// Subtitle
            Text(
              'We’ve sent a One-Time Password (OTP) to:',
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.grey[700],
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 6.h),

            /// Email Display
            Text(
              widget.email,
              style: TextStyle(
                fontSize: 15.sp,
                fontWeight: FontWeight.w600,
                color: BLACK_COLOR,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 40.h),

            /// OTP Input
            TextFormField(
              controller: otpController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Enter OTP',
                labelStyle: TextStyle(
                  fontSize: 14.sp,
                  color: Colors.grey[700],
                ),
                prefixIcon: const Icon(Icons.lock_outline),
                filled: true,
                fillColor: Colors.white,
                contentPadding: EdgeInsets.symmetric(
                  vertical: 14.h,
                  horizontal: 12.w,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                  borderSide: BorderSide(
                    color: Colors.grey.shade400,
                    width: 1.2,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                  borderSide: const BorderSide(
                    color: Colors.blueAccent,
                    width: 1.5,
                  ),
                ),
                errorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                  borderSide: const BorderSide(
                    color: Colors.redAccent,
                    width: 1.2,
                  ),
                ),
                focusedErrorBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                  borderSide: const BorderSide(
                    color: Colors.redAccent,
                    width: 1.5,
                  ),
                ),
              ),
            ),
            SizedBox(height: 25.h),

            /// Verify Button
            CustomInkwellButton(
              onTap: verifyOtp,
              height: 50.h,
              width: double.infinity,
              buttonName: isLoading ? 'Verifying...' : 'Verify OTP',
              fontSize: 16.sp,
            ),
            SizedBox(height: 13.h),

            /// Resend OTP Button
            TextButton(
              onPressed: secondsRemaining == 0 ? resendOtp : null,
              child: Text(
                secondsRemaining == 0
                    ? 'Didn’t get the code? Resend OTP'
                    : 'Resend available in ${formatTime(secondsRemaining)}',
                style: TextStyle(
                  fontSize: 14.sp,
                  color: BLACK_COLOR,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
