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
  final TextEditingController confirmpasswordController = TextEditingController();

  bool _isObscurePassword = true;
  bool _isObscureConfirmPassword = true;

  void register() async {
    if (!_formKey.currentState!.validate()) return;

    if (passwordController.text != confirmpasswordController.text) {
      showErrorDialog('Passwords do not match.');
      return;
    }

    var url = Uri.parse('http://10.0.2.2:3001/auth/register');
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
      Navigator.pushNamed(context, '/login');
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

  Widget buildTextField({
    required String label,
    required TextEditingController controller,
    bool isPassword = false,
    bool isConfirm = false,
    IconData? icon,
    bool obscureText = false,
    Function()? toggleObscure,
    String? Function(String?)? validator,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        validator: validator,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: icon != null ? Icon(icon) : null,
          suffixIcon: isPassword
              ? IconButton(
                  icon: Icon(obscureText ? Icons.visibility : Icons.visibility_off),
                  onPressed: toggleObscure,
                )
              : null,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
          fillColor: Colors.grey.shade100,
        ),
      ),
    );
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
                  text: 'Create Account',
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: BLACK_COLOR,
                ),
                SizedBox(height: 30.h),

                buildTextField(
                  label: 'First Name',
                  controller: firstnameController,
                  icon: Icons.person,
                  validator: (value) => value == null || value.isEmpty ? 'First name required' : null,
                ),
                buildTextField(
                  label: 'Last Name',
                  controller: lastnameController,
                  icon: Icons.person,
                  validator: (value) => value == null || value.isEmpty ? 'Last name required' : null,
                ),
                buildTextField(
                label: 'Email',
                controller: emailController,
                icon: Icons.email,
                validator: (value) {
                if (value == null || value.isEmpty) {
                return 'Email required';
                }

                // 📧 Regex for validating email
                final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
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
                  validator: (value) => value == null || value.isEmpty ? 'Username required' : null,
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
                  validator: (value) {
                    if (value == null || value.isEmpty) return 'Password required';
                    if (value.length < 6) return 'Minimum 6 characters';
                    return null;
                  },
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
                  validator: (value) => value == null || value.isEmpty ? 'Confirm your password' : null,
                ),

                SizedBox(height: 30.h),
                CustomInkwellButton(
                  onTap: register,
                  height: 50.h,
                  width: double.infinity,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  buttonName: 'Create',
                ),

                SizedBox(height: 20.h),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Already have an account? "),
                    GestureDetector(
                      onTap: () => Navigator.pushReplacementNamed(context, '/login'),
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
