import 'package:baobab_vision_project/screens/cart_screen.dart';
import 'package:baobab_vision_project/screens/vto_screen.dart';
import 'package:baobab_vision_project/widgets/cart_animation_button.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../constants.dart';
import '../widgets/custom_text.dart';
import 'package:baobab_vision_project/models/productModel.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class LensOption {
  final String id;
  final String label;
  final double price;
  final String type;

  LensOption({
    required this.id,
    required this.label,
    required this.price,
    required this.type,
  });

  factory LensOption.fromJson(Map<String, dynamic> json) {
    return LensOption(
      id: json['_id'] ?? '',
      label: json['label'],
      price: (json['price'] ?? 0).toDouble(),
      type: json['type'] ?? 'builtin',
    );
  }
}

Future<void> addToCart(
  String token,
  String productId,
  int quantity,
  String colorOptionId,
  String lensOptionId,
  String? prescriptionImage,
) async {
  final url = Uri.parse('http://10.0.2.2:3001/api/cartRoutes/add');

  final body = json.encode({
    'productId': productId,
    'quantity': quantity,
    'colorOptionId': colorOptionId,
    'lensOptionId': lensOptionId,
    'prescriptionImage': prescriptionImage,
  });

  final headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  try {
    final response = await http.post(url, body: body, headers: headers);
    if (response.statusCode == 200) {
      print('Item added to cart');
    } else {
      print('Failed to add item to cart');
      print(response.body);
    }
  } catch (error) {
    print('Error: $error');
  }
}

class DetailScreen extends StatefulWidget {
  final String productId;
  final String prodName;
  final String prodSize;
  final String prodPrice;
  final int numStars;
  final int quantity;
  final String description;
  final List<String> prodImages;
  final List<ColorOption> colorOptions;
  final List<LensOption> lensOptions;

  const DetailScreen({
    super.key,
    required this.productId,
    required this.prodName,
    required this.prodSize,
    required this.prodPrice,
    required this.numStars,
    required this.quantity,
    this.description = 'Lorem ipsum',
    required this.prodImages,
    required this.colorOptions,
    required this.lensOptions,
  });

  static DetailScreen fromJson(Map<String, dynamic> json) {
    final List<ColorOption> colorOptionsList = (json['colorOptions'] as List<dynamic>? ?? [])
        .map((e) => ColorOption.fromJson(e))
        .toList();

    final List<LensOption> lensOptionsList = (json['lensOptions'] as List<dynamic>? ?? [])
        .map((e) => LensOption.fromJson(e))
        .toList();

    return DetailScreen(
      productId: json['_id'] ?? '',
      prodName: json['name'] ?? '',
      prodSize: 'Standard',
      prodPrice: json['price'].toString(),
      numStars: json['numStars'] ?? 5,
      quantity: 1,
      description: json['description'] ?? '',
      prodImages: List<String>.from(json['imageUrls'] ?? []),
      colorOptions: colorOptionsList,
      lensOptions: lensOptionsList,
    );
  }

  @override
  _DetailScreenState createState() => _DetailScreenState();
}

PlatformFile? prescriptionFile;

class _DetailScreenState extends State<DetailScreen> {
  late PageController _pageController;
  int _selectedImageIndex = 0;
  int selectedColorIndex = 0;

  String? selectedLensType;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();

    if (widget.lensOptions.isNotEmpty) {
      selectedLensType = widget.lensOptions.first.label;
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<String?> getAuthToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  @override
  Widget build(BuildContext context) {
    final List<String> allImages = [
      widget.colorOptions[selectedColorIndex].imageUrl,
      ...widget.prodImages
    ];

    return Scaffold(
      backgroundColor: WHITE_COLOR,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: [
                    Stack(
                      children: [
                        SizedBox(
                          height: ScreenUtil().setHeight(280),
                          width: double.infinity,
                          child: PageView.builder(
                            controller: _pageController,
                            itemCount: allImages.length,
                            onPageChanged: (index) {
                              setState(() {
                                _selectedImageIndex = index;
                              });
                            },
                            itemBuilder: (context, index) {
                              return Image.network(
                                allImages[index],
                                fit: BoxFit.cover,
                                width: double.infinity,
                              );
                            },
                          ),
                        ),
                        Positioned(
                          top: ScreenUtil().setHeight(10),
                          left: ScreenUtil().setWidth(10),
                          child: InkWell(
                            onTap: () => Navigator.pop(context),
                            child: Icon(
                              Icons.keyboard_backspace,
                              size: ScreenUtil().setSp(40),
                            ),
                          ),
                        ),
                        Positioned(
                          top: ScreenUtil().setHeight(10),
                          right: ScreenUtil().setWidth(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.yellow[700],
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.star, color: Colors.white, size: 16),
                                SizedBox(width: 4),
                                CustomText(
                                  text: "${widget.numStars}",
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: ScreenUtil().setSp(14),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 10),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: List.generate(allImages.length, (index) {
                          return GestureDetector(
                            onTap: () {
                              _pageController.animateToPage(
                                index,
                                duration: Duration(milliseconds: 300),
                                curve: Curves.easeInOut,
                              );
                              setState(() {
                                _selectedImageIndex = index;
                              });
                            },
                            child: Container(
                              margin: EdgeInsets.symmetric(horizontal: 5),
                              padding: EdgeInsets.all(2),
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: _selectedImageIndex == index ? BLACK_COLOR : Colors.transparent,
                                  width: 2,
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(8),
                                child: Image.network(
                                  allImages[index],
                                  height: 60,
                                  width: 60,
                                  fit: BoxFit.cover,
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: ScreenUtil().setHeight(20)),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    CustomText(
                      text: widget.prodName,
                      color: Colors.black,
                      fontFamily: 'Montserrat',
                      fontWeight: FontWeight.w500,
                      fontSize: ScreenUtil().setSp(24),
                    ),
                    CustomText(
                      text: widget.prodPrice,
                      color: BLACK_COLOR,
                      fontFamily: 'Montserrat',
                      fontWeight: FontWeight.w800,
                      fontSize: ScreenUtil().setSp(24),
                    ),
                  ],
                ),
                SizedBox(height: ScreenUtil().setHeight(5)),
                CustomText(
                  text: 'Color: ${widget.colorOptions[selectedColorIndex].name}',
                  fontSize: ScreenUtil().setSp(15),
                  fontFamily: 'Montserrat',
                  color: Colors.black,
                ),
                SizedBox(height: ScreenUtil().setHeight(8)),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: List.generate(widget.colorOptions.length, (index) {
                      return _colorSwatch(widget.colorOptions[index], index == selectedColorIndex);
                    }),
                  ),
                ),
                SizedBox(height: ScreenUtil().setHeight(16)),
                Text(
  widget.description,
  style: TextStyle(
    fontSize: ScreenUtil().setSp(17),
    fontFamily: 'Nunito',
    fontWeight: FontWeight.w600,
  ),
  textAlign: TextAlign.justify,
),

                SizedBox(height: ScreenUtil().setHeight(16)),
                CustomText(
                  text: 'SELECT LENS TYPE:',
                  fontSize: ScreenUtil().setSp(15),
                  color: Colors.black,
                  fontFamily: 'Montserrat',
                  fontWeight: FontWeight.w600,
                ),
                SizedBox(height: ScreenUtil().setHeight(8)),
                DropdownButton<String>(
                  value: selectedLensType,
                  isExpanded: true,
                  dropdownColor: WHITE_COLOR,
                  onChanged: (String? newValue) {
                    setState(() {
                      selectedLensType = newValue!;
                    });
                  },
                  itemHeight: null,
                  items: [
                    DropdownMenuItem<String>(
                      enabled: false,
                      child: Text('BUILT-IN', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey[600])),
                    ),
                    ...widget.lensOptions
                        .where((o) => o.type == 'builtin')
                        .map((o) => DropdownMenuItem(value: o.label, child: Text('${o.label} (FREE)'))),
                    DropdownMenuItem<String>(
                      enabled: false,
                      child: Text('TINTED', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey[600])),
                    ),
                    ...widget.lensOptions
                        .where((o) => o.type == 'tinted')
                        .map((o) => DropdownMenuItem(value: o.label, child: Text('${o.label} (+₱${o.price.toStringAsFixed(0)})'))),
                    DropdownMenuItem<String>(
                      enabled: false,
                      child: Text('SUN ADAPTIVE', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey[600])),
                    ),
                    ...widget.lensOptions
                        .where((o) => o.type == 'adaptive')
                        .map((o) => DropdownMenuItem(
                              value: o.label,
                              child: SizedBox(
                                width: double.infinity,
                                child: Text('${o.label} (+₱${o.price.toStringAsFixed(0)})'),
                              ),
                            )),
                  ],
                ),
                SizedBox(height: ScreenUtil().setHeight(16)),
                CustomText(
                  text: 'UPLOAD PHOTO PRESCRIPTION',
                  fontSize: ScreenUtil().setSp(15),
                  color: Colors.black,
                  fontFamily: 'Montserrat',
                  fontWeight: FontWeight.w800,
                ),
                SizedBox(height: ScreenUtil().setHeight(8)),
                prescriptionFile == null
                    ? GestureDetector(
                        onTap: () async {
                          FilePickerResult? result = await FilePicker.platform.pickFiles(
                            type: FileType.custom,
                            allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf'],
                          );
                          if (result != null) {
                            setState(() {
                              prescriptionFile = result.files.first;
                            });
                          }
                        },
                        child: Container(
                          width: double.infinity,
                          padding: EdgeInsets.symmetric(vertical: 20),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.black),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.upload_file, color: Colors.grey),
                              SizedBox(height: 8),
                              Text(
                                'Choose File\nor drop file to upload',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Colors.grey[600], fontSize: 14),
                              ),
                            ],
                          ),
                        ),
                      )
                    : Container(
                        padding: EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.black),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.insert_drive_file, color: Colors.green),
                            SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                prescriptionFile!.name,
                                style: TextStyle(fontWeight: FontWeight.w600),
                              ),
                            ),
                            IconButton(
                              icon: Icon(Icons.delete, color: Colors.red),
                              onPressed: () {
                                setState(() {
                                  prescriptionFile = null;
                                });
                              },
                              tooltip: 'Remove file',
                            ),
                          ],
                        ),
                      ),
                SizedBox(height: ScreenUtil().setHeight(16)),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => VirtualTryOnScreen()),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: BLACK_COLOR,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          minimumSize: const Size(double.infinity, 50),
                        ),
                        child: CustomText(
                          text: 'Virtual Try-on',
                          fontSize: ScreenUtil().setSp(15),
                          color: Colors.white,
                        ),
                      ),
                    ),
                    SizedBox(width: 10),
                    Expanded(
                      child: CartAnimationButton(
  label: 'Add to Cart',
  // When adding to cart
onPressed: () async {
  final token = await getAuthToken();
  if (token != null) {
    final selectedLens = widget.lensOptions.firstWhere(
      (option) => option.label == selectedLensType,
      orElse: () => throw Exception("Invalid lens selected"),
    );

    await addToCart(
      token,
      widget.productId,
      1, // Ensure this is set to 1 for first-time addition, adjust if necessary
      widget.colorOptions[selectedColorIndex].id,
      selectedLens.id,
      prescriptionFile?.path ?? null,
    );
  } else {
    print('User is not logged in!');
  }
},

)
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _colorSwatch(ColorOption option, bool isSelected) {
    Widget swatch;
    if (option.type == 'solid') {
      swatch = CircleAvatar(
        radius: 12,
        backgroundColor: Color(int.parse('0xFF' + option.colors[0].substring(1))),
      );
    } else if (option.type == 'split') {
      swatch = Container(
        width: 24,
        height: 24,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            colors: option.colors.map((hex) => Color(int.parse('0xFF' + hex.substring(1)))).toList(),
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
      );
    } else {
      swatch = CircleAvatar(
        radius: 12,
        backgroundImage: NetworkImage(option.swatchUrl),
      );
    }

    return GestureDetector(
      onTap: () {
        final index = widget.colorOptions.indexOf(option);
        setState(() {
          selectedColorIndex = index;
          _selectedImageIndex = 0;
          _pageController.jumpToPage(0);
        });
      },
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected ? BLACK_COLOR : Colors.transparent,
            width: 2,
          ),
          shape: BoxShape.circle,
        ),
        child: swatch,
      ),
    );
  }
}
