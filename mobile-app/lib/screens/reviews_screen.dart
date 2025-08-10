import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../widgets/custom_text.dart';

class ReviewsScreen extends StatelessWidget {
  const ReviewsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Dummy reviews list (replace with data from your backend later)
    final List<Map<String, String>> reviews = [
      // Uncomment this to test data
      // {"name": "John Doe", "comment": "Great product!", "date": "Aug 10, 2025"},
      // {"name": "Jane Smith", "comment": "Very comfortable to wear.", "date": "Aug 8, 2025"},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Reviews'),
        backgroundColor: Colors.black,
      ),
      body: Padding(
        padding: EdgeInsets.all(16.w),
        child: reviews.isEmpty
            ? Center(
                child: CustomText(
                  text: 'No reviews yet.',
                  fontSize: 16.sp,
                  color: Colors.grey,
                ),
              )
            : ListView.separated(
                itemCount: reviews.length,
                separatorBuilder: (context, index) => Divider(),
                itemBuilder: (context, index) {
                  final review = reviews[index];
                  return ListTile(
                    title: CustomText(
                      text: review["name"] ?? "Anonymous",
                      fontSize: 16.sp,
                      fontWeight: FontWeight.bold,
                    ),
                    subtitle: CustomText(
                      text: review["comment"] ?? "",
                      fontSize: 14.sp,
                    ),
                    trailing: CustomText(
                      text: review["date"] ?? "",
                      fontSize: 12.sp,
                      color: Colors.grey,
                    ),
                  );
                },
              ),
      ),
    );
  }
}