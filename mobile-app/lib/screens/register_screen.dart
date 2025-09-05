import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import '../constants.dart';
import '../widgets/custom_inkwell_button.dart';
import '../widgets/custom_text.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController firstnameController = TextEditingController();
  final TextEditingController lastnameController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmpasswordController =
      TextEditingController();

  bool _isObscurePassword = true;
  bool _isObscureConfirmPassword = true;
  bool _isPrivacyAccepted = false;

  // Password strength state
  String _passwordStrength = '';
  Color _strengthColor = Colors.red;

  void register() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_isPrivacyAccepted) {
      showErrorDialog('You must accept the Data Privacy Policy to continue.');
      return;
    }

    if (passwordController.text != confirmpasswordController.text) {
      showErrorDialog('Passwords do not match.');
      return;
    }

    var url = Uri.parse(
        'https://baobab-vision-project.onrender.com/api/auth/register');

    var response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'firstname': firstnameController.text,
        'lastname': lastnameController.text,
        'email': emailController.text,
        'username': usernameController.text,
        'password': passwordController.text,
      }),
    );

    var resData = json.decode(response.body);
    if (response.statusCode == 201) {
      // Show success dialog before navigating
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Success'),
          content: const Text('Your account has been registered successfully.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context); // Close the dialog
                Navigator.pushReplacementNamed(context, '/login'); // Go to login
              },
              child: const Text('OK'),
            ),
          ],
        ),
      );
    } else {
      showErrorDialog(resData['message']);
    }
  }

  void showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Failed'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          )
        ],
      ),
    );
  }

  // Password strength checker
  void checkPasswordStrength(String password) {
    if (password.isEmpty) {
      _passwordStrength = '';
      _strengthColor = Colors.red;
    } else if (password.length < 8) {
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

  // Reusable TextField widget
  Widget buildTextField({
    required String label,
    required TextEditingController controller,
    bool isPassword = false,
    bool isConfirm = false,
    IconData? icon,
    bool obscureText = false,
    Function()? toggleObscure,
    String? Function(String?)? validator,
    Function(String)? onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        validator: validator,
        onChanged: onChanged,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: icon != null ? Icon(icon) : null,
          suffixIcon: isPassword
              ? IconButton(
                  icon: Icon(
                      obscureText ? Icons.visibility : Icons.visibility_off),
                  onPressed: toggleObscure,
                )
              : null,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
          fillColor: Colors.grey.shade100,
          errorMaxLines: 3,
        ),
      ),
    );
  }

  // Custom validator for password showing all missing info
  String? passwordValidator(String? value) {
    if (value == null || value.isEmpty) return 'Password required';

    List<String> missing = [];

    if (value.length < 8) missing.add('at least 8 characters');
    if (value.length > 12) missing.add('no more than 12 characters');
    if (!RegExp(r'[A-Z]').hasMatch(value)) missing.add('1 uppercase letter');
    if (!RegExp(r'[a-z]').hasMatch(value)) missing.add('1 lowercase letter');
    if (!RegExp(r'\d').hasMatch(value)) missing.add('1 number');
    if (!RegExp(r'[^A-Za-z0-9]').hasMatch(value)) missing.add('1 symbol');

    if (missing.isEmpty) return null;
    return 'Missing: ${missing.join(', ')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 16.h),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                SizedBox(height: 30.h),
                const CustomText(
                  text: 'Register Account',
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: BLACK_COLOR,
                ),
                SizedBox(height: 25.h),
                buildTextField(
                  label: 'First Name',
                  controller: firstnameController,
                  icon: Icons.person,
                  validator: (value) => value == null || value.isEmpty
                      ? 'First name required'
                      : null,
                ),
                buildTextField(
                  label: 'Last Name',
                  controller: lastnameController,
                  icon: Icons.person,
                  validator: (value) => value == null || value.isEmpty
                      ? 'Last name required'
                      : null,
                ),
                buildTextField(
                  label: 'Email',
                  controller: emailController,
                  icon: Icons.email,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Email required';
                    }
                    final emailRegex =
                        RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
                    if (!emailRegex.hasMatch(value)) {
                      return 'Please enter a valid email';
                    }
                    return null;
                  },
                ),
                buildTextField(
                  label: 'Username',
                  controller: usernameController,
                  icon: Icons.account_circle,
                  validator: (value) => value == null || value.isEmpty
                      ? 'Username required'
                      : null,
                ),
                buildTextField(
                  label: 'Password',
                  controller: passwordController,
                  isPassword: true,
                  icon: Icons.lock,
                  obscureText: _isObscurePassword,
                  toggleObscure: () {
                    setState(() {
                      _isObscurePassword = !_isObscurePassword;
                    });
                  },
                  validator: passwordValidator,
                  onChanged: (value) {
                    checkPasswordStrength(value);
                  },
                ),
                if (_passwordStrength.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 4.0, bottom: 8.0),
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
                buildTextField(
                  label: 'Confirm Password',
                  controller: confirmpasswordController,
                  isPassword: true,
                  icon: Icons.lock_outline,
                  obscureText: _isObscureConfirmPassword,
                  toggleObscure: () {
                    setState(() {
                      _isObscureConfirmPassword = !_isObscureConfirmPassword;
                    });
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Confirm your password';
                    }
                    if (value != passwordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 15.h),
                Center(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Checkbox(
                        value: _isPrivacyAccepted,
                        onChanged: (value) {
                          setState(() {
                            _isPrivacyAccepted = value ?? false;
                          });
                        },
                      ),
                      GestureDetector(
                        onTap: () {
                          showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: const Text("Data Privacy Policy"),
                              content: const SingleChildScrollView(
                                child: Text(
                                  "By registering, you agree to our Data Privacy Policy. "
                                  "Your personal data will be collected and processed in compliance "
                                  "with applicable laws.",
                                ),
                              ),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(context),
                                  child: const Text("Close"),
                                )
                              ],
                            ),
                          );
                        },
                        child: const Text.rich(
                          TextSpan(
                            text: "I agree to the ",
                            children: [
                              TextSpan(
                                text: "Data Privacy Policy",
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.blue,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 13.h),
                CustomInkwellButton(
                  onTap: register,
                  height: 50.h,
                  width: double.infinity,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  buttonName: 'Submit',
                ),
                SizedBox(height: 20.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Already have an account? "),
                    GestureDetector(
                      onTap: () =>
                          Navigator.pushReplacementNamed(context, '/login'),
                      child: const Text(
                        'Login here',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: BLACK_COLOR,
                        ),
                      ),
                    )
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}