import 'package:baobab_vision_project/constants.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

class EmailVerificationScreen extends StatefulWidget {
  final String username;
  final String password;
  final String email;
  final String token;
  final bool isVerified;

  const EmailVerificationScreen({
    required this.username,
    required this.password,
    required this.email,
    required this.token,
    required this.isVerified,
    super.key,
  });

  @override
  State<EmailVerificationScreen> createState() => _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends State<EmailVerificationScreen> {
  bool _isChecking = false;
  bool _isResending = false;
  int _cooldownSeconds = 0;
  Timer? _cooldownTimer;
  String? _currentToken;

  @override
  void initState() {
    super.initState();
    _currentToken = widget.token;
  }

  Future<void> checkVerificationStatus() async {
    setState(() => _isChecking = true);

    final response = await http.post(
      Uri.parse('http://10.0.2.2:3001/api/auth/check-verification-token'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'token': _currentToken}),
    );

    try {
      final data = json.decode(response.body);
      print('Verification token check: $data');

      if (response.statusCode == 200 && data['verified'] == true) {
        await loginUserAgain();
      } else if (response.statusCode == 400 && data['expired'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Your verification link expired. Kindly resend.')),
        );
      } else if (response.statusCode == 200 && data['verified'] == false) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Email not verified yet. Please check your inbox.')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['message'] ?? 'Unexpected error')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Something went wrong. Please try again.')),
      );
    }

    setState(() => _isChecking = false);
  }

  Future<void> loginUserAgain() async {
    final url = Uri.parse('http://10.0.2.2:3001/api/auth/login');


    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'username': widget.username,
        'password': widget.password,
      }),
    );

    if (response.statusCode == 200) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Login failed after verification.')),
      );
    }
  }

  Future<void> resendVerificationEmail() async {
    if (_isResending || _cooldownSeconds > 0) return;

    setState(() {
      _isResending = true;
    });

    final response = await http.post(
      Uri.parse('http://10.0.2.2:3001/api/auth/resend-verification'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'email': widget.email}),
    );

    try {
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _currentToken = data['token']; // 🔁 update token from backend
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Verification email sent again.')),
        );
        startCooldown();
      } else {
        final data = json.decode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['message'] ?? 'Failed to resend.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Something went wrong. Please try again.')),
      );
    } finally {
      setState(() {
        _isResending = false;
      });
    }
  }

  void startCooldown() {
    _cooldownSeconds = 30;
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _cooldownSeconds--;
      });
      if (_cooldownSeconds <= 0) {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _cooldownTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        title: const Text('Email Verification'),
        backgroundColor: WHITE_COLOR,
        elevation: 0,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            elevation: 6,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 40.0, horizontal: 24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.mark_email_unread, size: 60, color: BLACK_COLOR),
                  const SizedBox(height: 20),
                  Text(
                    'We’ve sent a verification message to:',
                    style: TextStyle(fontSize: 16, color: Colors.grey[700]),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    widget.email,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 30),
                  _isChecking
                      ? const CircularProgressIndicator()
                      : SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: checkVerificationStatus,
                            icon: const Icon(Icons.refresh, color: Colors.white),
                            label: const Text(
                              "I've Verified",
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              backgroundColor: const Color.fromARGB(255, 32, 150, 69),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          ),
                        ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: (_isResending || _cooldownSeconds > 0)
                          ? null
                          : resendVerificationEmail,
                      icon: _isResending
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.send, color: Colors.white),
                      label: Text(
                        _cooldownSeconds > 0
                            ? 'Resend in $_cooldownSeconds s'
                            : 'Resend Verification Email',
                        style: const TextStyle(
                          fontSize: 16,
                          color: Colors.white,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: BLACK_COLOR,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 15),
                  Text(
                    'After clicking the button in your email, return to this screen and press "I’ve Verified".',
                    style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
