import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        backgroundColor: WHITE_COLOR,
        elevation: 1,
        title: CustomText(
          text: 'Privacy Policy',
          fontSize: 18.sp,
          fontWeight: FontWeight.bold,
          color: BLACK_COLOR,
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: BLACK_COLOR),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _header('Your Privacy Matters'),
            _bodyText(
              "This Privacy Policy outlines how we collect, use, and protect your information when you shop with us on our mobile application.",
            ),
            _section('1. Information We Collect', [
              'Personal details (name, email, phone number)',
              'Shipping and billing address',
              'Order history and cart contents',
              'Payment information (processed securely via third parties)',
              'Device and usage data (app usage, crash logs, etc.)',
            ]),
            _section('2. How We Use Your Information', [
              'To process and deliver your orders',
              'To send updates and promotional offers',
              'To personalize your shopping experience',
              'To improve our app functionality and services',
              'To comply with legal obligations',
            ]),
            _section('3. Payment Security', [
              'We do not store credit card details.',
              'Payments are securely processed through trusted third-party providers (e.g., Stripe, PayPal).',
            ]),
            _section('4. Order and Shipping Data', [
              'Your shipping information is used solely to fulfill your orders.',
              'Tracking numbers and status updates are shared via email or push notifications.',
            ]),
            _section('5. Sharing of Information', [
              'With delivery partners to fulfill your orders',
              'With analytics and infrastructure tools (e.g., Firebase)',
              'With legal authorities if required',
              'We never sell your personal data to third parties.',
            ]),
            _section('6. Your Rights', [
              'Access, update, or delete your data at any time',
              'Opt out of promotional communications',
              'Request data export or portability',
              'Contact us for data-related requests: privacy@sharedsocials.com',
            ]),
            _section('7. Data Retention', [
              'We retain order-related data as long as required by tax and accounting laws.',
              'Other personal data is deleted upon account closure or by request.',
            ]),
            _section('8. Children\'s Privacy', [
              'Our app is not intended for users under 13.',
              'We do not knowingly collect data from children.',
            ]),
            _section('9. Changes to This Policy', [
              'We may update this policy periodically.',
              'Significant changes will be communicated through the app.',
            ]),
            SizedBox(height: 20.h),
            CustomText(
              text: "Last Updated: May 25, 2025",
              fontSize: 12.sp,
              color: Colors.grey,
            ),
          ],
        ),
      ),
    );
  }

  Widget _header(String title) {
    return Padding(
      padding: EdgeInsets.only(bottom: 10.h),
      child: CustomText(
        text: title,
        fontSize: 16.sp,
        fontWeight: FontWeight.bold,
        color: BLACK_COLOR,
      ),
    );
  }

  Widget _bodyText(String content) {
    return Padding(
      padding: EdgeInsets.only(bottom: 20.h),
      child: CustomText(
        text: content,
        fontSize: 14.sp,
        color: Colors.black87,
      ),
    );
  }

  Widget _section(String title, List<String> bullets) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CustomText(
            text: title,
            fontSize: 15.sp,
            fontWeight: FontWeight.bold,
            color: BLACK_COLOR,
          ),
          SizedBox(height: 6.h),
          ...bullets.map(
            (bullet) => Padding(
              padding: EdgeInsets.only(bottom: 6.h),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CustomText(text: '• ', fontSize: 14.sp, color: Colors.black87),
                  Expanded(
                    child: CustomText(text: bullet, fontSize: 14.sp, color: Colors.black87),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
