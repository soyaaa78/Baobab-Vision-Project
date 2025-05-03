import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';
import '../widgets/custom_horizontal_product_card.dart';
import '../widgets/custom_vertical_product_card.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  String username = '';
  File? _imageFile;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    String? path = prefs.getString('profileImagePath');
    setState(() {
      username = prefs.getString('username') ?? 'Guest';
      if (path != null) {
        _imageFile = File(path);
      }
    });
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString('profileImagePath', pickedFile.path);
      setState(() {
        _imageFile = File(pickedFile.path);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        title: CustomText(
          text: 'PROFILE',
          fontSize: ScreenUtil().setSp(20),
          fontWeight: FontWeight.bold,
          color: BLACK_COLOR,
        ),
        backgroundColor: WHITE_COLOR,
      ),
      body: Padding(
        padding: EdgeInsets.all(ScreenUtil().setWidth(20)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                GestureDetector(
                  onTap: _pickImage,
                  child: CircleAvatar(
                    radius: 40,
                    backgroundImage: _imageFile != null
                        ? FileImage(_imageFile!)
                        : AssetImage('assets/images/shizuku.jpeg')
                            as ImageProvider,
                    child: Align(
                      alignment: Alignment.bottomRight,
                      child: Container(
                        padding: EdgeInsets.all(2),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.edit, color: Colors.white, size: 16),
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 10.w),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CustomText(
                      text: '$username',
                      fontSize: ScreenUtil().setSp(22),
                      fontWeight: FontWeight.bold,
                      color: BLACK_COLOR,
                    ),
                    SizedBox(height: 1.h),
                    CustomText(
                      text: 'aniascobeverly@gmail.com',
                      fontSize: ScreenUtil().setSp(12),
                      color: Colors.grey,
                    ),
                  ],
                ),
              ],
            ),
            SizedBox(height: 20.h),
            _buildDropdown('My Personal Information', [
              'Name: John Doe',
              'Email: john.doe@example.com',
              'Phone: 123-456-7890'
            ]),
            _buildDropdown(
                'Order Status', ['Pending', 'Preparing', 'Out for Delivery']),
            _buildSettingsDropdown(),
          ],
        ),
      ),
    );
  }

  Widget _buildDropdown(String title, List<String> items) {
    return ExpansionTile(
      title: CustomText(
        text: title,
        fontSize: ScreenUtil().setSp(18),
        fontWeight: FontWeight.bold,
        color: BLACK_COLOR,
      ),
      children: items
          .map(
            (item) => Padding(
              padding: EdgeInsets.symmetric(vertical: 5.h, horizontal: 10.w),
              child: CustomText(
                text: item,
                fontSize: ScreenUtil().setSp(16),
                color: Colors.black54,
              ),
            ),
          )
          .toList(),
    );
  }

  Widget _buildSettingsDropdown() {
    return ExpansionTile(
      title: CustomText(
        text: 'Settings',
        fontSize: ScreenUtil().setSp(18),
        fontWeight: FontWeight.bold,
        color: BLACK_COLOR,
      ),
      children: [
        _buildSettingsButton('Change Password', () {}),
        _buildSettingsButton('Privacy Policy', () {}),
        _buildSettingsButton('Log Out', () => _confirmLogout(context)),
      ],
    );
  }

  Widget _buildSettingsButton(String title, VoidCallback onPressed) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 5.h, horizontal: 10.w),
      child: TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          padding: EdgeInsets.symmetric(vertical: 10.h),
          alignment: Alignment.centerLeft,
        ),
        child: CustomText(
          text: title,
          fontSize: ScreenUtil().setSp(16),
          color: Colors.black54,
        ),
      ),
    );
  }
}

void _confirmLogout(BuildContext context) {
  showDialog(
    context: context,
    builder: (BuildContext dialogContext) {
      return AlertDialog(
        title: CustomText(
          text: 'Confirm Logout',
          fontSize: ScreenUtil().setSp(18),
          fontWeight: FontWeight.bold,
          color: BLACK_COLOR,
        ),
        content: CustomText(
          text: 'Are you sure you want to log out?',
          fontSize: ScreenUtil().setSp(16),
          color: Colors.black87,
        ),
        actions: <Widget>[
          TextButton(
            child: CustomText(
              text: 'Cancel',
              fontSize: ScreenUtil().setSp(14),
              color: Colors.grey,
            ),
            onPressed: () {
              Navigator.of(dialogContext).pop();
            },
          ),
          TextButton(
            child: CustomText(
              text: 'Log Out',
              fontSize: ScreenUtil().setSp(14),
              color: Colors.redAccent,
            ),
            onPressed: () async {
              SharedPreferences prefs = await SharedPreferences.getInstance();
              await prefs.clear();
              Navigator.of(dialogContext).pop();
              Navigator.of(context)
                  .pushNamedAndRemoveUntil('/login', (route) => false);
            },
          ),
        ],
      );
    },
  );
}
