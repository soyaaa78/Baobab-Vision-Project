import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:baobab_vision_project/constants.dart';
import 'package:shared_preferences/shared_preferences.dart';

class EmailOtpVerificationScreen extends StatefulWidget {
  final String email;

  const EmailOtpVerificationScreen({super.key, required this.email});

  @override
  State<EmailOtpVerificationScreen> createState() =>
      _EmailOtpVerificationScreenState();
}

class _EmailOtpVerificationScreenState
    extends State<EmailOtpVerificationScreen> {
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  bool _isLoading = false;

  String get _otp => _controllers.map((c) => c.text).join();

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), duration: const Duration(seconds: 2)),
    );
  }

  String _maskedEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;

    final name = parts[0];
    final domain = parts[1];
    final visible = name.length > 2 ? name.substring(0, 2) : name;
    final stars = '*' * (name.length - visible.length);

    return '$visible$stars@$domain';
  }

  Future<void> _verifyOtp() async {
    if (_otp.length != 6 || _otp.contains(RegExp(r'[^0-9]'))) {
      _showSnackBar('Enter all 6 digits');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await http.post(
        Uri.parse(
            'https://baobab-vision-project.onrender.com/api/auth/verify-email-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': widget.email, 'otp': _otp}),
      );

      final res = jsonDecode(response.body);

      if (response.statusCode == 200) {
        final token = res['token'];
        if (token != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', token);

          final profileRes = await http.get(
            Uri.parse(
                'https://baobab-vision-project.onrender.com/api/user/profile'),
            headers: {
              'Authorization': 'Bearer $token',
              'Content-Type': 'application/json',
            },
          );

          if (profileRes.statusCode == 200) {
            final profileData = jsonDecode(profileRes.body);

            await prefs.setString('firstname', profileData['firstname'] ?? '');
            await prefs.setString('lastname', profileData['lastname'] ?? '');
            await prefs.setString('email', profileData['email'] ?? '');

            if (profileData['profileImage'] != null &&
                profileData['profileImage'].toString().isNotEmpty) {
              String imgPath = profileData['profileImage'];
              if (imgPath.startsWith('/')) imgPath = imgPath.substring(1);
              await prefs.setString('profileImageUrl',
                  'https://baobab-vision-project.onrender.com/$imgPath');
            } else {
              await prefs.remove('profileImageUrl');
            }
          }
        }

        setState(() => _isLoading = false);
        Navigator.pushReplacementNamed(context, '/home');
      } else {
        setState(() => _isLoading = false);
        _showSnackBar(res['message'] ?? 'Invalid or expired OTP');
      }
    } catch (e) {
      setState(() => _isLoading = false);
      _showSnackBar('Verification failed. Try again.');
    }
  }

  Future<void> _resendOtp() async {
    try {
      final response = await http.post(
        Uri.parse(
            'https://baobab-vision-project.onrender.com/api/auth/resend-email-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': widget.email}),
      );

      final res = jsonDecode(response.body);
      _showSnackBar(res['message'] ?? 'OTP resent');
    } catch (e) {
      _showSnackBar('Failed to resend OTP');
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF6A11CB), Color(0xFF2575FC)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Card(
              elevation: 8,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20)),
              color: Colors.white,
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Account Verification',
                      style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: BLACK_COLOR,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Column(
                      children: [
                        Text(
                          'Enter the 6-digit code sent to your email',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: Colors.black87,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _maskedEmail(widget.email),
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.black54,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 30),

                    // ✅ Flexible OTP Input Fields
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: List.generate(6, (index) {
                        return Expanded(
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: TextField(
                              controller: _controllers[index],
                              focusNode: _focusNodes[index],
                              maxLength: 1,
                              keyboardType: TextInputType.number,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                  fontSize: 22, fontWeight: FontWeight.bold),
                              decoration: InputDecoration(
                                counterText: '',
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                      color: Colors.grey, width: 1.5),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide: const BorderSide(
                                      color: Colors.blue, width: 2),
                                ),
                                fillColor: Colors.grey[100],
                                filled: true,
                              ),
                              onChanged: (val) {
                                if (val.length == 1 && index < 5) {
                                  _focusNodes[index + 1].requestFocus();
                                } else if (val.isEmpty && index > 0) {
                                  _focusNodes[index - 1].requestFocus();
                                }
                              },
                            ),
                          ),
                        );
                      }),
                    ),

                    const SizedBox(height: 40),

                    // Verify Button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _verifyOtp,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: BLACK_COLOR,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 5,
                        ),
                        child: _isLoading
                            ? const CircularProgressIndicator(
                                color: Colors.white)
                            : const Text(
                                'Verify',
                                style: TextStyle(
                                    color: Colors.white, fontSize: 18),
                              ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Resend
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Didn't receive code? "),
                        GestureDetector(
                          onTap: _resendOtp,
                          child: const Text(
                            'Request again',
                            style: TextStyle(
                              color: BLACK_COLOR,
                              fontWeight: FontWeight.bold,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}