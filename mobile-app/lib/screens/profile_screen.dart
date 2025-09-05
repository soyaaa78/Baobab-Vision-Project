import 'dart:async';
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

  // Dynamic counts for all statuses
  Map<String, int> orderCounts = {
    'pending': 0,
    'processing': 0,
    'ready_to_pickup': 0,
    'to_rate': 0,
  };

  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _fetchAndLoadProfile();
    _fetchOrderCounts();
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  void _startAutoRefresh() {
    _refreshTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      _fetchOrderCounts();
    });
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  String capitalize(String s) {
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1);
  }

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
        Uri.parse(
            'https://baobab-vision-project.onrender.com/api/user/profile'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        SharedPreferences prefs = await SharedPreferences.getInstance();

        await prefs.setString('firstname', data['firstname'] ?? '');
        await prefs.setString('lastname', data['lastname'] ?? '');
        await prefs.setString('email', data['email'] ?? '');

        String? imgUrl;
        if (data['profileImage'] != null &&
            data['profileImage'].toString().isNotEmpty) {
          String imgPath = data['profileImage'];
          if (imgPath.startsWith('/')) imgPath = imgPath.substring(1);
          imgUrl = 'http://192.168.100.56:3001/$imgPath';
          await prefs.setString('profileImageUrl', imgUrl);
        } else {
          await prefs.remove('profileImageUrl');
          imgUrl = null;
        }

        setState(() {
          firstname = data['firstname'] ?? 'User';
          lastname = data['lastname'] ?? '';
          email = data['email'] ?? 'user@example.com';
          profileImageUrl = imgUrl;
          _localImageFile = null;
          _isLoading = false;
        });
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

  // Updated: Fetch counts from backend orderCounts endpoint
 Future<void> _fetchOrderCounts() async {
  final token = await _getToken();
  if (token == null) return;

  try {
    final response = await http.get(
      Uri.parse(
          'https://baobab-vision-project.onrender.com/api/order-counts/'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      setState(() {
        orderCounts = {
          'pending': data['pending'] ?? 0,
          'processing': data['processing'] ?? 0,
          'ready_to_pickup': data['ready_to_pickup'] ?? 0,
          'to_rate': data['to_rate'] ?? 0,
        };
      });
    } else {
      print('Failed to fetch order counts: ${response.statusCode}');
    }
  } catch (e) {
    print('Error fetching order counts: $e');
  }
}

  @override
  Widget build(BuildContext context) {
    ImageProvider profileImageProvider;

    if (_localImageFile != null) {
      profileImageProvider = FileImage(_localImageFile!);
    } else if (profileImageUrl != null && profileImageUrl!.isNotEmpty) {
      profileImageProvider = NetworkImage(profileImageUrl!);
    } else {
      profileImageProvider =
          const AssetImage('assets/images/default_profile_icon.jpg');
    }

    return Scaffold(
      backgroundColor: WHITE_COLOR,
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Column(
                children: [
                  _buildHeader(profileImageProvider),
                  SizedBox(height: 10.h),
                  _buildOrdersSection(),
                  SizedBox(height: 10.h),
                  const Divider(height: 1, thickness: 0.5),
                  SizedBox(height: 10.h),
                  _buildSettingsOption(Icons.edit, 'View & Edit Profile', () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const EditProfileScreen()),
                    ).then((_) => _fetchAndLoadProfile());
                  }),
                  _buildSettingsOption(
                      Icons.delivery_dining_sharp, 'Delivery Orders', () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const DeliveryOrdersScreen()),
                    );
                  }),
                  _buildSettingsOption(
                      Icons.receipt_long, 'Completed Purchases', () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) =>
                              const CompletedPurchasesScreen()),
                    );
                  }),
                  _buildSettingsOption(Icons.cancel, 'Cancelled Orders', () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                          builder: (context) => const CancelledOrdersScreen()),
                    );
                  }),
                  _buildSettingsOption(
                      Icons.help_outline, 'Help Centre', () {}),
                  _buildSettingsOption(
                    Icons.logout,
                    'Logout',
                    () => _confirmLogout(context),
                  ),
                  SizedBox(height: 20.h),
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
            colors: [Color(0xFF6A11CB), Color(0xFF2575FC)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        boxShadow: [
          BoxShadow(
              color: Colors.black26, blurRadius: 8.r, offset: Offset(0, 4.h))
        ],
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(40.r),
          bottomRight: Radius.circular(40.r),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            radius: 50.r,
            backgroundImage: profileImageProvider,
            backgroundColor: Colors.grey.shade200,
          ),
          SizedBox(height: 12.h),
          CustomText(
            text: '${capitalize(firstname)} ${capitalize(lastname)}',
            fontSize: 22.sp,
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
      {
        'icon': Icons.payment,
        'label': 'Pending',
        'screen': const PendingOrdersScreen(),
        'count': orderCounts['pending'] ?? 0,
      },
      {
        'icon': Icons.shopping_cart,
        'label': 'Processing',
        'screen': const ProcessingOrdersScreen(),
        'count': orderCounts['processing'] ?? 0,
      },
      {
        'icon': Icons.local_shipping,
        'label': 'For Pick-up',
        'screen': const ReadyForPickupOrdersScreen(),
        'count': orderCounts['ready_to_pickup'] ?? 0,
      },
      {
        'icon': Icons.star_border,
        'label': 'To Rate',
        'screen': const ToRateScreen(),
        'count': orderCounts['to_rate'] ?? 0,
      },
    ];

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 12.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(height: 20.h),
          CustomText(
            text: 'My Orders',
            fontSize: 16.sp,
            fontWeight: FontWeight.bold,
            color: BLACK_COLOR,
          ),
          SizedBox(height: 15.h),
          GridView.count(
            padding: EdgeInsets.zero,
            crossAxisCount: 4,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10.h,
            crossAxisSpacing: 10.w,
            childAspectRatio: 0.9,
            children: orders.map((order) {
              return InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => order['screen'] as Widget),
                  ).then((_) => _fetchOrderCounts());
                },
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Stack(
                      clipBehavior: Clip.none,
                      children: [
                        CircleAvatar(
                          backgroundColor: Colors.grey.shade100,
                          radius: 22.r,
                          child: Icon(order['icon'] as IconData,
                              color: BLACK_COLOR, size: 20.sp),
                        ),
                        // Always show badge; update dynamically
                        Positioned(
                          top: -6.h,
                          right: -6.w,
                          child: Container(
                            padding: EdgeInsets.all(4.r),
                            decoration: BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                              border:
                                  Border.all(color: Colors.white, width: 1.w),
                            ),
                            child: Text(
                              '${order['count']}',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 10.sp,
                                  fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 6.h),
                    CustomText(
                      text: order['label'].toString(),
                      fontSize: 13.sp,
                      color: Colors.black,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              );
            }).toList(),
          )
        ],
      ),
    );
  }

  Widget _buildSettingsOption(IconData icon, String title, VoidCallback onTap) {
    return Column(
      children: [
        ListTile(
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
        ),
        Divider(height: 1, thickness: 0.5, indent: 16.w, endIndent: 16.w)
      ],
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
                Navigator.of(context)
                    .pushNamedAndRemoveUntil('/login', (route) => false);
              },
              child: const Text('Log Out', style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }
}