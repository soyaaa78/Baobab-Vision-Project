import 'dart:convert';
import 'dart:io';

import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();

  TextEditingController firstnameController = TextEditingController();
  TextEditingController lastnameController = TextEditingController();
  TextEditingController emailController = TextEditingController();
  TextEditingController usernameController = TextEditingController();

  TextEditingController phoneController = TextEditingController();
  TextEditingController addressController = TextEditingController();

  File? _imageFile;
  String? profileImageUrl;

  bool _isLoading = false;
  bool _isEditing = false;

  // For detecting if any change was made
  Map<String, String> _initialValues = {};

  @override
  void initState() {
    super.initState();
    _fetchUserProfile();
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  Future<void> _fetchUserProfile() async {
    setState(() => _isLoading = true);
    final token = await _getToken();
    if (token == null) {
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

        setState(() {
          firstnameController.text = data['firstname'] ?? '';
          lastnameController.text = data['lastname'] ?? '';
          emailController.text = data['email'] ?? '';
          usernameController.text = data['username'] ?? '';
          phoneController.text = data['phone'] ?? '';
          addressController.text = data['address'] ?? '';

          if (data['profileImage'] != null &&
              data['profileImage'].toString().isNotEmpty) {
            String imgPath = data['profileImage'].toString();

            // Remove leading slash to avoid double slash in URL
            if (imgPath.startsWith('/')) {
              imgPath = imgPath.substring(1);
            }

            // Encode URI components to handle spaces and special characters
            profileImageUrl = 'https://baobab-vision-project.onrender.com/' +
                Uri.encodeFull(imgPath);
          } else {
            profileImageUrl = null;
          }

          _initialValues = {
            'firstname': firstnameController.text,
            'lastname': lastnameController.text,
            'email': emailController.text,
            'username': usernameController.text,
            'phone': phoneController.text,
            'address': addressController.text,
            'profileImage': profileImageUrl ?? '',
          };
        });
      } else {
        print('Failed to fetch profile: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching profile: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _pickImage() async {
    if (!_isEditing) return; // only allow picking image in edit mode
    final pickedFile =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _imageFile = File(pickedFile.path);
      });
    }
  }

  bool _hasChanges() {
    if (_initialValues['firstname'] != firstnameController.text) return true;
    if (_initialValues['lastname'] != lastnameController.text) return true;
    if (_initialValues['email'] != emailController.text) return true;
    if (_initialValues['username'] != usernameController.text) return true;
    if (_initialValues['phone'] != phoneController.text) return true;
    if (_initialValues['address'] != addressController.text) return true;
    if (_imageFile != null) return true;
    return false;
  }

  Future<void> _saveProfile() async {
    print('Save profile started');
    if (!_formKey.currentState!.validate()) return;

    if (!_hasChanges()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No changes detected')),
      );
      return;
    }

    final token = await _getToken();
    print('Token: $token'); // Check token

    if (token == null) return;

    setState(() => _isLoading = true);

    try {
      var uri = Uri.parse(
          'https://baobab-vision-project.onrender.com/api/user/profile');
      var request = http.MultipartRequest('PUT', uri);

      request.headers['Authorization'] = 'Bearer $token';

      request.fields['firstname'] = firstnameController.text;
      request.fields['lastname'] = lastnameController.text;
      request.fields['email'] = emailController.text;
      request.fields['username'] = usernameController.text;
      request.fields['phone'] = phoneController.text;
      request.fields['address'] = addressController.text;

      if (_imageFile != null) {
        request.files.add(await http.MultipartFile.fromPath(
            'profileImage', _imageFile!.path));
      }

      final response = await request.send();
      print('Response status code: ${response.statusCode}');
      final respStr = await response.stream.bytesToString();
      print('Response body: $respStr');

      if (response.statusCode == 200) {
        final updatedUser = jsonDecode(respStr);

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated successfully')),
        );

        setState(() {
          _isEditing = false;
          _imageFile = null;
          profileImageUrl = updatedUser['profileImage'] ?? profileImageUrl;
          _initialValues = {
            'firstname': firstnameController.text,
            'lastname': lastnameController.text,
            'email': emailController.text,
            'username': usernameController.text,
            'phone': phoneController.text,
            'address': addressController.text,
            'profileImage': profileImageUrl ?? '',
          };
        });
        _fetchUserProfile();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content:
                  Text('Failed to update profile: ${response.statusCode}')),
        );
      }
    } catch (e) {
      print('Error updating profile: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error updating profile')),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Widget _buildTextOrField({
    required String label,
    required TextEditingController controller,
    String? Function(String?)? validator,
    bool multiline = false,
    bool readOnly = false,
    bool enabled = true,
  }) {
    if (_isEditing) {
      return Padding(
        padding: EdgeInsets.symmetric(vertical: 8.h),
        child: TextFormField(
          controller: controller,
          decoration: InputDecoration(
            labelText: label,
            border:
                OutlineInputBorder(borderRadius: BorderRadius.circular(8.r)),
          ),
          maxLines: multiline ? 3 : 1,
          validator: validator,
          readOnly: readOnly,
          enabled: enabled, // <-- Use enabled here
          style: enabled ? null : TextStyle(color: Colors.grey),
        ),
      );
    } else {
      return Padding(
        padding: EdgeInsets.symmetric(vertical: 12.h),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 130.w,
              child: CustomText(
                text: '$label:',
                fontSize: 15.sp,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
            Expanded(
              child: CustomText(
                text: controller.text.isNotEmpty ? controller.text : '-',
                fontSize: 15.sp,
                color: Colors.black87,
              ),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    ImageProvider profileImageProvider;

    if (_imageFile != null) {
      profileImageProvider = FileImage(_imageFile!);
    } else if (profileImageUrl != null && profileImageUrl!.isNotEmpty) {
      profileImageProvider = NetworkImage(profileImageUrl!);
    } else {
      profileImageProvider =
          const AssetImage('assets/images/default_profile_icon.png');
    }

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        title: Text(
          _isEditing ? 'Edit Profile' : 'Profile',
          style: TextStyle(
            color: Colors.black87,
            fontWeight: FontWeight.w600,
            fontSize: 20.sp,
          ),
        ),
        iconTheme: IconThemeData(color: Colors.black87),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              tooltip: 'Edit Profile',
              onPressed: () => setState(() => _isEditing = true),
            )
          else ...[
            IconButton(
              icon: const Icon(Icons.check),
              tooltip: 'Save Changes',
              onPressed: _saveProfile,
            ),
            IconButton(
              icon: const Icon(Icons.close),
              tooltip: 'Cancel',
              onPressed: () async {
                if (_hasChanges()) {
                  final result = await showDialog<String>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Unsaved changes'),
                      content: const Text(
                          'There are unsaved changes. Save or discard?'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop('discard'),
                          child: const Text('Discard'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.of(context).pop('save'),
                          child: const Text('Save'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.of(context).pop('cancel'),
                          child: const Text('Cancel'),
                        ),
                      ],
                    ),
                  );

                  if (result == 'save') {
                    await _saveProfile();
                  } else if (result == 'discard') {
                    setState(() {
                      _isEditing = false;
                      _fetchUserProfile();
                      _imageFile = null;
                    });
                  }
                  // If 'cancel', do nothing (close dialog and remain editing)
                } else {
                  setState(() {
                    _isEditing = false;
                    _fetchUserProfile();
                    _imageFile = null;
                  });
                }
              },
            ),
          ],
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: EdgeInsets.all(16.w),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    Center(
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: CircleAvatar(
                          radius: 55.r,
                          backgroundColor: Colors.grey.shade300,
                          backgroundImage: profileImageProvider,
                          child: _isEditing
                              ? Align(
                                  alignment: Alignment.bottomRight,
                                  child: CircleAvatar(
                                    radius: 16.r,
                                    backgroundColor: Colors.white,
                                    child: Icon(Icons.camera_alt,
                                        size: 20.sp, color: Colors.black87),
                                  ),
                                )
                              : null,
                        ),
                      ),
                    ),
                    SizedBox(height: 30.h),
                    _buildTextOrField(
                      label: 'First Name',
                      controller: firstnameController,
                      validator: (val) => val == null || val.isEmpty
                          ? 'Please enter your first name'
                          : null,
                    ),
                    _buildTextOrField(
                      label: 'Last Name',
                      controller: lastnameController,
                      validator: (val) => val == null || val.isEmpty
                          ? 'Please enter your last name'
                          : null,
                    ),
                    _buildTextOrField(
                      label: 'Email',
                      controller: emailController,
                      validator: (val) {
                        if (val == null || val.isEmpty)
                          return 'Please enter your email';
                        if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(val))
                          return 'Enter a valid email';
                        return null;
                      },
                      readOnly: true,
                      enabled: false,
                    ),
                    _buildTextOrField(
                      label: 'Username',
                      controller: usernameController,
                      validator: (val) => val == null || val.isEmpty
                          ? 'Please enter your username'
                          : null,
                      readOnly: true,
                      enabled: false,
                    ),
                    _buildTextOrField(
                      label: 'Mobile Phone Number',
                      controller: phoneController,
                      validator: (val) => val == null || val.isEmpty
                          ? 'Please enter your phone number'
                          : null,
                    ),
                    _buildTextOrField(
                      label: 'Address',
                      controller: addressController,
                      multiline: true,
                      validator: (val) => val == null || val.isEmpty
                          ? 'Please enter your address'
                          : null,
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
