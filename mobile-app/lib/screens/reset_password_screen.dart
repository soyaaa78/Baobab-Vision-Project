import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;

import '../constants.dart';
import '../widgets/custom_dialog.dart';
import '../widgets/custom_inkwell_button.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String email;
  final String token;

  const ResetPasswordScreen({
    super.key,
    required this.email,
    required this.token,
  });

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final TextEditingController passwordController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool isLoading = false;
  bool _obscureText = true;

  // Password strength state
  String _passwordStrength = '';
  Color _strengthColor = Colors.red;

  /// Password strength checker
  void checkPasswordStrength(String password) {
    if (password.isEmpty) {
      _passwordStrength = '';
      _strengthColor = Colors.red;
    } else if (password.length < 6) {
      _passwordStrength = 'Too Short';
      _strengthColor = Colors.red;
    } else {
      int strengthPoints = 0;
      if (RegExp(r'[A-Z]').hasMatch(password)) strengthPoints++;
      if (RegExp(r'[a-z]').hasMatch(password)) strengthPoints++;
      if (RegExp(r'\d').hasMatch(password)) strengthPoints++;
      if (RegExp(r'[^A-Za-z0-9]').hasMatch(password)) strengthPoints++;

      if (strengthPoints <= 2) {
        _passwordStrength = 'Weak';
        _strengthColor = Colors.red;
      } else if (strengthPoints == 3) {
        _passwordStrength = 'Medium';
        _strengthColor = Colors.orange;
      } else if (strengthPoints == 4) {
        _passwordStrength = 'Strong';
        _strengthColor = Colors.green;
      }
    }
    setState(() {});
  }

  /// Custom validator for password showing all missing info
  String? passwordValidator(String? value) {
    if (value == null || value.isEmpty) return 'Password required';

    List<String> missing = [];

    if (value.length < 6) missing.add('at least 6 characters');
    if (!RegExp(r'[A-Z]').hasMatch(value)) missing.add('1 uppercase letter');
    if (!RegExp(r'[a-z]').hasMatch(value)) missing.add('1 lowercase letter');
    if (!RegExp(r'\d').hasMatch(value)) missing.add('1 number');
    if (!RegExp(r'[^A-Za-z0-9]').hasMatch(value)) missing.add('1 symbol');

    if (missing.isEmpty) return null;
    return 'Missing: ${missing.join(', ')}';
  }

  Future<void> resetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => isLoading = true);

    final url = Uri.parse(
        'https://baobab-vision-project.onrender.com/api/auth/reset-password');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'token': widget.token,
          'newPassword': passwordController.text.trim(),
        }),
      );

      final resData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        customDialog(
          context,
          title: 'Success',
          content: 'Your password has been reset.',
        );

        await Future.delayed(const Duration(seconds: 2));

        Navigator.pushNamedAndRemoveUntil(
          context,
          '/login',
          (route) => false,
        );
      } else {
        customDialog(context,
            title: 'Error', content: resData['message'] ?? 'Password reset failed.');
      }
    } catch (e) {
      customDialog(context,
          title: 'Error',
          content: 'Something went wrong. Please try again.');
    } finally {
      setState(() => isLoading = false);
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
          'Reset Password',
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
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              /// Icon
              Center(
                child: Icon(
                  Icons.lock_reset,
                  size: 80.sp,
                  color: Colors.blueAccent,
                ),
              ),
              SizedBox(height: 20.h),

              /// Title
              Center(
                child: Text(
                  'Set a New Password',
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
                  'Your new password must be different from the old one.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: Colors.grey[700],
                    height: 1.5,
                  ),
                ),
              ),
              SizedBox(height: 40.h),

              /// Password input
              TextFormField(
                controller: passwordController,
                obscureText: _obscureText,
                validator: passwordValidator,
                onChanged: checkPasswordStrength,
                decoration: InputDecoration(
                  labelText: "New Password",
                  labelStyle: TextStyle(
                    fontSize: 14.sp,
                    color: Colors.grey[700],
                  ),
                  prefixIcon: const Icon(Icons.lock_outline),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureText ? Icons.visibility_off : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() => _obscureText = !_obscureText);
                    },
                  ),
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

              if (_passwordStrength.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8.0, bottom: 16.0),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Strength: $_passwordStrength',
                      style: TextStyle(
                        color: _strengthColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),

              SizedBox(height: 40.h),

              /// Reset button
              CustomInkwellButton(
                onTap: resetPassword,
                height: 52.h,
                width: double.infinity,
                buttonName: isLoading ? 'Resetting...' : 'Reset Password',
                fontSize: 16.sp,
              ),
            ],
          ),
        ),
      ),
    );
  }
}