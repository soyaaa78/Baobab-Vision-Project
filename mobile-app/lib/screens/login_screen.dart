import 'dart:convert';
import 'package:baobab_vision_project/screens/email_otp_verification_screen.dart';
import 'package:baobab_vision_project/screens/email_verification_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants.dart';
import '../screens/home_screen.dart';
import '../widgets/custom_dialog.dart';
import '../widgets/custom_inkwell_button.dart';
import '../widgets/custom_text.dart';

class LogInScreen extends StatefulWidget {
  const LogInScreen({super.key});

  @override
  State<LogInScreen> createState() => _LogInScreenState();
}

class _LogInScreenState extends State<LogInScreen> {
  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool _isObscure = true;

  // Function to save the user's info to SharedPreferences
  Future<void> _saveUserInfo(
    String username, 
    String firstname, 
    String lastname, 
    String email,
    String token,
    String userId,
  ) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString('username', username);
    await prefs.setString('firstname', firstname);
    await prefs.setString('lastname', lastname); 
    await prefs.setString('email', email);
    await prefs.setString('token', token); // Save the token
    await prefs.setString('userId', userId);
  }

  // Login function
  Future<void> login() async {
  var url = Uri.parse('http://10.0.2.2:3001/authRoutes/login');

  try {
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': usernameController.text.trim(),
        'password': passwordController.text.trim(),
      }),
    );

    print('🔄 LOGIN RESPONSE: ${response.body}');
    final resData = jsonDecode(response.body);
    print('🔄 LOGIN RESPONSE (decoded): $resData');

    if (response.statusCode == 403 && resData['requiresVerification'] == true) {
      // Navigate to email verification screen if the email is not verified
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => EmailOtpVerificationScreen(
            email: resData['email'],
          ),
        ),
      );
    } else if (response.statusCode == 200) {
      final token = resData['token'];
      final userId = resData['userId']; // Get userId from the response
      final firstname = resData['firstname'] ?? '';
      final lastname = resData['lastname'] ?? '';
      final email = resData['email'] ?? '';
      final username = usernameController.text.trim(); 

      // Save token, userId, and other user data to SharedPreferences
      SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token); // Save token
      await prefs.setString('userId', userId); // Save userId
      await prefs.setString('firstname', firstname); // Save firstname
      await prefs.setString('lastname', lastname); // Save lastname
      await prefs.setString('email', email); // Save email
      await prefs.setString('username', username); //

      // Navigate to home screen
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      // Show login failed message if something went wrong
      customDialog(
        context,
        title: 'Login Failed',
        content: resData['message'] ?? 'Invalid login',
      );
    }
  } catch (e) {
    print('❌ Login Exception: $e');
    customDialog(
      context,
      title: 'Error',
      content: 'Unexpected error occurred. Please check your connection.',
    );
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      body: SingleChildScrollView(
        child: SizedBox(
          height: ScreenUtil().screenHeight,
          width: ScreenUtil().screenWidth,
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                SizedBox(height: 40.h),

                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 25.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Image.asset(
                          'assets/images/baobab_logo.png',
                          height: 150.h,
                        ),
                      ),
                      SizedBox(height: 30.h),

                      /// Username Field
                      TextFormField(
                        controller: usernameController,
                        validator: (value) => value == null || value.isEmpty
                            ? 'Please enter your username'
                            : null,
                        decoration: InputDecoration(
                          labelText: 'Username',
                          labelStyle: TextStyle(
                            fontSize: 15.sp,
                            color: BLACK_COLOR,
                          ),
                          prefixIcon: const Icon(Icons.person),
                          border: const OutlineInputBorder(),
                        ),
                      ),
                      SizedBox(height: 20.h),

                      /// Password Field
                      TextFormField(
                        controller: passwordController,
                        obscureText: _isObscure,
                        validator: (value) => value == null || value.isEmpty
                            ? 'Please enter your password'
                            : null,
                        decoration: InputDecoration(
                          labelText: 'Password',
                          labelStyle: TextStyle(
                            fontSize: 15.sp,
                            color: BLACK_COLOR,
                          ),
                          prefixIcon: const Icon(Icons.lock),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _isObscure
                                  ? Icons.visibility_off
                                  : Icons.visibility,
                            ),
                            onPressed: () {
                              setState(() {
                                _isObscure = !_isObscure;
                              });
                            },
                          ),
                          border: const OutlineInputBorder(),
                        ),
                      ),
                      SizedBox(height: 25.h),

                      /// Forgot Password Link
                      Center(
                        child: GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(context, '/forgot-password');
                          },
                          child: Text(
                            'Forgot Password?',
                            style: TextStyle(
                              color: Theme.of(context).primaryColor,
                              fontSize: 14.sp,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 25.h),

                      /// Login Button
                      CustomInkwellButton(
                        onTap: () {
                          if (_formKey.currentState!.validate()) {
                            login();
                          }
                        },
                        height: 45.h,
                        width: double.infinity,
                        buttonName: 'Login',
                        fontSize: 16.sp,
                      ),
                    ],
                  ),
                ),

                /// Register Link
                Container(
                  height: 50.h,
                  width: double.infinity,
                  color: BLACK_COLOR,
                  alignment: Alignment.center,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Don't have an account?",
                        style: TextStyle(
                          color: Colors.grey.shade300,
                          fontSize: 14.sp,
                        ),
                      ),
                      GestureDetector(
                        onTap: () =>
                            Navigator.popAndPushNamed(context, '/register'),
                        child: Text(
                          ' Register Here',
                          style: TextStyle(
                            color: WHITE_COLOR,
                            fontWeight: FontWeight.bold,
                            fontSize: 14.sp,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
