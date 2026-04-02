import 'dart:convert';
import 'dart:io';
import 'dart:async';

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
  final _formKey = GlobalKey<FormState>(); // retained but no hard validation

  TextEditingController firstnameController = TextEditingController();
  TextEditingController lastnameController = TextEditingController();
  TextEditingController emailController = TextEditingController();
  TextEditingController usernameController = TextEditingController();
  TextEditingController phoneController = TextEditingController();
  TextEditingController addressController = TextEditingController();

  File? _imageFile;
  String? profileImageUrl;

  static const String _apiBase =
      'https://baobab-vision-project-0234.onrender.com';

  bool _isLoading = false;
  bool _isEditing = false;
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
    if (mounted) setState(() => _isLoading = true);
    final token = await _getToken();
    if (token == null) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }

    try {
      final response = await http.get(
        Uri.parse('$_apiBase/api/user/profile'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 20));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        setState(() {
          firstnameController.text = data['firstname'] ?? '';
          lastnameController.text = data['lastname'] ?? '';
          emailController.text = data['email'] ?? '';
          usernameController.text = data['username'] ?? '';
          phoneController.text = data['phone'] ?? '';
          addressController.text = data['address'] ?? '';

          profileImageUrl = _normalizeProfileImageUrl(data['profileImage']);

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
    } on TimeoutException {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Request timed out loading profile')),
        );
      }
    } catch (e) {
      print('Error fetching profile: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String? _normalizeProfileImageUrl(dynamic raw) {
    if (raw == null) return null;
    String path = raw.toString();
    if (path.isEmpty) return null;
    // If already absolute (http/https) return as is
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (!path.startsWith('/')) path = '/$path';
    return '$_apiBase$path';
  }

  Future<void> _pickImage() async {
    if (!_isEditing) return;
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
    // No required validation; proceed with partial updates of changed fields
    final token = await _getToken();
    if (token == null) return;

    // Collect only changed fields
    final Map<String, String> changed = {};
    if (_initialValues['firstname'] != firstnameController.text) {
      changed['firstname'] = firstnameController.text;
    }
    if (_initialValues['lastname'] != lastnameController.text) {
      changed['lastname'] = lastnameController.text;
    }
    if (_initialValues['email'] != emailController.text) {
      changed['email'] = emailController.text;
    }
    if (_initialValues['username'] != usernameController.text) {
      changed['username'] = usernameController.text;
    }
    if (_initialValues['phone'] != phoneController.text) {
      changed['phone'] = phoneController.text;
    }
    if (_initialValues['address'] != addressController.text) {
      changed['address'] = addressController.text;
    }

    if (changed.isEmpty && _imageFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nothing to update')),
      );
      setState(() => _isEditing = false);
      return;
    }

    if (mounted) setState(() => _isLoading = true);
    try {
      final uri = Uri.parse('$_apiBase/api/user/profile');
      final request = http.MultipartRequest('PUT', uri);
      request.headers['Authorization'] = 'Bearer $token';

      changed.forEach((k, v) => request.fields[k] = v);

      if (_imageFile != null) {
        request.files.add(await http.MultipartFile.fromPath(
            'profileImage', _imageFile!.path));
      }

      final response =
          await request.send().timeout(const Duration(seconds: 25));
      final respStr = await response.stream.bytesToString();
      if (response.statusCode == 200) {
        final updatedUser = jsonDecode(respStr);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated')),
        );
        if (updatedUser is Map<String, dynamic>) {
          // Update controllers only for returned fields
          firstnameController.text =
              updatedUser['firstname'] ?? firstnameController.text;
          lastnameController.text =
              updatedUser['lastname'] ?? lastnameController.text;
          emailController.text = updatedUser['email'] ?? emailController.text;
          // email & username readonly; still refresh for consistency
          usernameController.text =
              updatedUser['username'] ?? usernameController.text;
          phoneController.text = updatedUser['phone'] ?? phoneController.text;
          addressController.text =
              updatedUser['address'] ?? addressController.text;
          profileImageUrl =
              _normalizeProfileImageUrl(updatedUser['profileImage']);
        }
        if (mounted) {
          setState(() {
            _isEditing = false;
            _imageFile = null;
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
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Update failed (${response.statusCode})')),
        );
      }
    } on TimeoutException {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Update timed out')),
        );
      }
    } catch (e) {
      print('Error updating profile: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error updating profile')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
        padding: EdgeInsets.symmetric(vertical: 12.h),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.blueGrey.shade50,
            borderRadius: BorderRadius.circular(14.r),
            border: Border.all(color: Colors.blueGrey.shade200),
            boxShadow: [
              BoxShadow(
                  color: Colors.black12, blurRadius: 4, offset: Offset(0, 3))
            ],
          ),
          child: TextFormField(
            controller: controller,
            decoration: InputDecoration(
              labelText: label,
              labelStyle: TextStyle(
                  color: Colors.blueGrey.shade900, fontWeight: FontWeight.w600),
              border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14.r),
                  borderSide: BorderSide.none),
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 20.w, vertical: 18.h),
            ),
            maxLines: multiline ? 3 : 1,
            validator: validator,
            readOnly: readOnly,
            enabled: enabled,
            style: enabled
                ? TextStyle(color: Colors.black87)
                : TextStyle(color: Colors.grey.shade600),
          ),
        ),
      );
    } else {
      return Padding(
        padding: EdgeInsets.symmetric(vertical: 12.h),
        child: Card(
          color: Colors.blueGrey.shade50,
          elevation: 3,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14.r),
            side: BorderSide(color: Colors.blueGrey.shade200),
          ),
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 18.w, vertical: 18.h),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: 140.w,
                  child: CustomText(
                    text: '$label:',
                    fontSize: 15.sp,
                    fontWeight: FontWeight.bold,
                    color: Colors.blueGrey.shade900,
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
          ),
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
      profileImageProvider = const AssetImage(
          'assets/images/default_person_icon.png'); // default person icon
    }

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
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
              child: Column(
                children: [
                  Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      CircleAvatar(
                        radius: 60.r,
                        backgroundColor: Colors.grey.shade300,
                        backgroundImage: profileImageProvider,
                      ),
                      if (_isEditing)
                        GestureDetector(
                          onTap: _pickImage,
                          child: CircleAvatar(
                            radius: 18.r,
                            backgroundColor: Colors.white,
                            child: Icon(Icons.camera_alt,
                                size: 22.sp, color: Colors.black87),
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 30.h),
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        _buildTextOrField(
                          label: 'First Name',
                          controller: firstnameController,
                          validator: null,
                        ),
                        _buildTextOrField(
                          label: 'Last Name',
                          controller: lastnameController,
                          validator: null,
                        ),
                        _buildTextOrField(
                          label: 'Email',
                          controller: emailController,
                          validator: null,
                          readOnly: true,
                          enabled: false,
                        ),
                        _buildTextOrField(
                          label: 'Username',
                          controller: usernameController,
                          validator: null,
                          readOnly: true,
                          enabled: false,
                        ),
                        _buildTextOrField(
                          label: 'Mobile Phone Number',
                          controller: phoneController,
                          validator: null,
                        ),
                        _buildTextOrField(
                          label: 'Address',
                          controller: addressController,
                          multiline: true,
                          validator: null,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
