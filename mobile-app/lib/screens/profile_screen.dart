import 'dart:convert';
import 'dart:io';
import 'package:baobab_vision_project/screens/cancelled_order_screen.dart';
import 'package:baobab_vision_project/screens/completed_purchases_screen.dart';
import 'package:baobab_vision_project/screens/delivery_order_screen.dart';
import 'package:baobab_vision_project/screens/edit_profile_screen.dart';
import 'package:baobab_vision_project/screens/privacy_policy_screen.dart';
import 'package:baobab_vision_project/screens/pending_orders_screen.dart';
import 'package:baobab_vision_project/screens/processing_orders_screen.dart';
import 'package:baobab_vision_project/screens/ready_for_pickup_orders_screen.dart';
import 'package:baobab_vision_project/screens/to_rate_screen.dart';
import 'package:baobab_vision_project/widgets/cancelled_order_card.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String firstname = 'User';
  String lastname = '';
  String email = 'user@example.com';
  String? profileImageUrl;
  File? _localImageFile;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchAndLoadProfile();
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // Helper to capitalize only first letter
  String capitalize(String s) {
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1);
  }

  // Fetch profile from backend API, save to SharedPreferences, then load
  Future<void> _fetchAndLoadProfile() async {
    setState(() => _isLoading = true);

    final token = await _getToken();
    if (token == null) {
      print('No token found');
      setState(() => _isLoading = false);
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('http://192.168.100.56:3001/api/user/profile'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        SharedPreferences prefs = await SharedPreferences.getInstance();

        // Save profile data to SharedPreferences
        await prefs.setString('firstname', data['firstname'] ?? '');
        await prefs.setString('lastname', data['lastname'] ?? '');
        await prefs.setString('email', data['email'] ?? '');

        // Save profileImageUrl after prepending base URL if available
        String? imgUrl;
        if (data['profileImage'] != null && data['profileImage'].toString().isNotEmpty) {
          String imgPath = data['profileImage'];
          if (imgPath.startsWith('/')) {
            imgPath = imgPath.substring(1);
          }
          imgUrl = 'http://192.168.100.56:3001/$imgPath';
          await prefs.setString('profileImageUrl', imgUrl);
        } else {
          await prefs.remove('profileImageUrl');
          imgUrl = null;
        }

        // Load the saved data into state variables
        setState(() {
          firstname = data['firstname'] ?? 'User';
          lastname = data['lastname'] ?? '';
          email = data['email'] ?? 'user@example.com';
          profileImageUrl = imgUrl;

          _localImageFile = null; // reset local image cache if any
          _isLoading = false;
        });

        print('Profile fetched from API: $firstname $lastname, $email');
        print('Profile Image URL: $profileImageUrl');
      } else {
        print('Failed to fetch profile, status: ${response.statusCode}');
        setState(() => _isLoading = false);
      }
    } catch (e) {
      print('Error fetching profile: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _loadProfileFromPrefs() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    setState(() {
      firstname = prefs.getString('firstname') ?? 'User';
      lastname = prefs.getString('lastname') ?? '';
      email = prefs.getString('email') ?? 'user@example.com';
      profileImageUrl = prefs.getString('profileImageUrl');
      _localImageFile = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    ImageProvider profileImageProvider;

    if (_localImageFile != null) {
      profileImageProvider = FileImage(_localImageFile!);
    } else if (profileImageUrl != null && profileImageUrl!.isNotEmpty) {
      profileImageProvider = NetworkImage(profileImageUrl!);
    } else {
      profileImageProvider = const AssetImage('assets/images/default_profile_icon.jpg');
    }

    return Scaffold(
      backgroundColor: WHITE_COLOR,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                children: [
                  _buildHeader(profileImageProvider),
                  SizedBox(height: 2.h),
                  _buildOrdersSection(),
                  SizedBox(height: 6.h),
                  const Divider(height: 1, thickness: 0.5),
                  SizedBox(height: 10.h),
                  _buildSettingsOption(Icons.edit, 'View & Edit Profile', () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => const EditProfileScreen()),
                    ).then((_) => _fetchAndLoadProfile()); // Refresh after returning
                  }),
                   _buildSettingsOption(Icons.delivery_dining_sharp, 'Delivery Orders', () {
                    Navigator.push(
    context,
    MaterialPageRoute(builder: (context) => const DeliveryOrdersScreen()),
  );
                   }),
                 _buildSettingsOption(Icons.receipt_long, 'Completed Purchases', () {
  Navigator.push(
    context,
    MaterialPageRoute(builder: (context) => const CompletedPurchasesScreen()),
  );
}),
 _buildSettingsOption(Icons.cancel, 'Cancelled Orders', () {
  Navigator.push(
    context,
    MaterialPageRoute(builder: (context) => const CancelledOrdersScreen()),
  );
 }),
                  _buildSettingsOption(Icons.help_outline, 'Help Centre', () {}),
                 _buildSettingsOption(
  Icons.logout,  // use logout icon (or any icon you like)
  'Logout',
  () => _confirmLogout(context),
),
                ],
              ),
            ),
    );
  }

  Widget _buildHeader(ImageProvider profileImageProvider) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.only(top: 60.h, bottom: 16.h),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [WHITE_COLOR, BLACK_COLOR],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(40.r),
          bottomRight: Radius.circular(40.r),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 45.r,
            backgroundImage: profileImageProvider,
            backgroundColor: Colors.grey.shade200,
          ),
          SizedBox(height: 12.h),
          CustomText(
            text: '${capitalize(firstname)} ${capitalize(lastname)}',
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
          SizedBox(height: 4.h),
          CustomText(
            text: email,
            fontSize: 14.sp,
            color: Colors.white70,
          ),
        ],
      ),
    );
  }

  Widget _buildOrdersSection() {
    final orders = [
      {'icon': Icons.payment, 'label': 'Pending', 'screen': const PendingOrdersScreen()},
      {'icon': Icons.shopping_cart, 'label': 'Processing', 'screen': const ProcessingOrdersScreen()},
      {'icon': Icons.local_shipping, 'label': 'For Pick-up', 'screen': const ReadyForPickupOrdersScreen()},
      {'icon': Icons.star_border, 'label': 'To Rate', 'screen': const ToRateScreen ()},
    ];

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 10.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 30.h),
          Padding(
  padding: EdgeInsets.only(left: 7.w),
  child: CustomText(
    text: 'My Orders',
    fontSize: 16.sp,
    fontWeight: FontWeight.bold,
    color: BLACK_COLOR,
  ),
),
          SizedBox(height: 25.h,),
          MediaQuery.removePadding(
  context: context,
  removeTop: true,
  child: GridView.count(
    padding: EdgeInsets.zero,  // important
    crossAxisCount: 4,
    shrinkWrap: true,
    physics: const NeverScrollableScrollPhysics(),
    mainAxisSpacing: 6.h,
    crossAxisSpacing: 6.w,
    childAspectRatio: 0.95,
    children: orders.map((order) {
      return InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => order['screen'] as Widget),
          );
        },
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              backgroundColor: Colors.grey.shade100,
              radius: 21.r,
              child: Icon(order['icon'] as IconData, color: BLACK_COLOR, size: 18.sp),
            ),
            SizedBox(height: 3.h),
            CustomText(
              text: order['label'].toString(),
              fontSize: 12.sp,
              color: Colors.black,
            ),
          ],
        ),
      );
    }).toList(),
  ),
)
        ],
      ),
    );
  }

  Widget _buildSettingsOption(IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      dense: true,
      contentPadding: EdgeInsets.symmetric(horizontal: 16.w),
      horizontalTitleGap: 8.w,
      minVerticalPadding: 6.h,
      leading: Icon(icon, color: Colors.black87, size: 20.sp),
      title: CustomText(
        text: title,
        fontSize: 15.sp,
        color: Colors.black,
      ),
      trailing: Icon(Icons.chevron_right, size: 18.sp),
      onTap: onTap,
    );
  }

  void _confirmLogout(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: CustomText(
            text: 'Confirm Logout',
            fontSize: 18.sp,
            fontWeight: FontWeight.bold,
            color: BLACK_COLOR,
          ),
          content: CustomText(
            text: 'Are you sure you want to log out?',
            fontSize: 16.sp,
            color: Colors.black87,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                SharedPreferences prefs = await SharedPreferences.getInstance();
                await prefs.clear();
                Navigator.of(dialogContext).pop();
                Navigator.of(context).pushNamedAndRemoveUntil('/login', (route) => false);
              },
              child: const Text('Log Out', style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }
}
