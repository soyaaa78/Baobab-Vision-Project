import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../constants.dart';
import '../services/api_client.dart';
import '../utils/api_error_message.dart';
import '../widgets/custom_dialog.dart';
import '../widgets/custom_inkwell_button.dart';
import 'email_reset_password_screen.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController emailController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  Future<void> sendOtp() async {
    setState(() => _isLoading = true);

    try {
      final response = await ApiClient.postJson(
        '/api/auth/request-otp',
        {'email': emailController.text.trim()},
      );

      if (!mounted) return;

      if (response.statusCode == 200) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) =>
                EmailResetPasswordScreen(email: emailController.text.trim()),
          ),
        );
      } else {
        customDialog(
          context,
          title: response.statusCode == 404 ? 'Email Not Found' : 'Error',
          content: apiResponseMessage(
            response.body,
            response.statusCode == 404
                ? 'No account found for this email.'
                : 'Unable to send OTP email. Please try again later.',
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      final networkFailure = isNetworkFailure(e);
      customDialog(context,
          title: networkFailure ? 'Network Error' : 'Error',
          content: networkFailure
              ? 'Please check your internet connection and try again.'
              : 'Unable to request password reset. Please try again later.');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
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
          'Forgot Password',
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            /// Header Illustration or Icon
            Center(
              child: Icon(
                Icons.lock_reset_outlined,
                size: 80.sp,
                color: Colors.blueAccent,
              ),
            ),
            SizedBox(height: 20.h),

            /// Title
            Center(
              child: Text(
                'Reset Your Password',
                style: TextStyle(
                  fontSize: 22.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ),
            SizedBox(height: 10.h),

            /// Subtitle
            Center(
              child: Text(
                'Enter your email address below and we’ll send you a one-time password (OTP) to verify your identity.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14.sp,
                  color: Colors.grey[700],
                  height: 1.5,
                ),
              ),
            ),
            SizedBox(height: 40.h),

            /// Email Input
            Form(
              key: _formKey,
              child: TextFormField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                validator: (value) => value == null || value.isEmpty
                    ? 'Please enter your email'
                    : null,
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  labelStyle: TextStyle(
                    fontSize: 14.sp,
                    color: Colors.grey[700],
                  ),
                  prefixIcon: const Icon(Icons.email_outlined),
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
            ),
            SizedBox(height: 30.h),

            /// Send OTP Button
            CustomInkwellButton(
              onTap: () {
                if (_formKey.currentState!.validate()) {
                  sendOtp();
                }
              },
              height: 50.h,
              width: double.infinity,
              buttonName: _isLoading ? 'Sending...' : 'Send OTP',
              fontSize: 16.sp,
            ),
            SizedBox(height: 20.h),

            /// Back to Login
            Center(
              child: GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Text(
                  'Back to Login',
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: BLACK_COLOR,
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
