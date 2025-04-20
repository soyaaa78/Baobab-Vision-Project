import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class VirtualTryOnScreen extends StatefulWidget {
  const VirtualTryOnScreen({super.key});

  @override
  _VirtualTryOnScreenState createState() => _VirtualTryOnScreenState();
}

class _VirtualTryOnScreenState extends State<VirtualTryOnScreen> {
  int selectedItemIndex = 0; // Index of selected item

  // Sample eyewear items (replace with actual image assets)
  final List<String> eyewearImages = [
    'assets/images/eyewear_1.png',
    'assets/images/eyewear_2.png',
    'assets/images/eyewear_3.png',
    'assets/images/eyewear_4.png',
    'assets/images/eyewear_5.png',
    'assets/images/eyewear_6.png',
    'assets/images/eyewear_7.png',
    'assets/images/eyewear_8.png',
    'assets/images/eyewear_9.png',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(
          'Virtual Try-On',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.black,
        centerTitle: true,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Camera Preview (Placeholder)
          Expanded(
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  color: Colors.black26, // Placeholder for Camera Feed
                  width: double.infinity,
                  child: Icon(
                    Icons.camera_alt,
                    color: Colors.white54,
                    size: 100,
                  ),
                ),
                if (eyewearImages.isNotEmpty)
                  Positioned(
                    top: 200.h, // Adjust based on user face position
                    child: Image.asset(
                      eyewearImages[selectedItemIndex],
                      width: 200.w,
                    ),
                  ),
              ],
            ),
          ),

          // Eyewear Selection
          Container(
            padding: EdgeInsets.symmetric(vertical: 10.h),
            color: Colors.black,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 15.w),
                  child: Text(
                    'Select Eyewear',
                    style: TextStyle(color: Colors.white, fontSize: 18.sp),
                  ),
                ),
                SizedBox(height: 10.h),
                SizedBox(
                  height: 100.h,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: eyewearImages.length,
                    itemBuilder: (context, index) {
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            selectedItemIndex = index;
                          });
                        },
                        child: Container(
                          margin: EdgeInsets.symmetric(horizontal: 8.w),
                          padding: EdgeInsets.all(8.w),
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: selectedItemIndex == index
                                  ? Colors.blue
                                  : Colors.transparent,
                              width: 2,
                            ),
                            borderRadius: BorderRadius.circular(10),
                            color: Colors.white10,
                          ),
                          child: Image.asset(
                            eyewearImages[index],
                            width: 80.w,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
