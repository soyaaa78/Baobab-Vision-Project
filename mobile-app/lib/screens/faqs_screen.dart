import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class FaqsScreen extends StatelessWidget {
  final List<Map<String, String>> faqs = [
    {
      "question": "How do I place an order?",
      "answer": "Browse products, add them to your cart, and proceed to checkout to place an order."
    },
    {
      "question": "What payment methods are accepted?",
      "answer": "We accept credit/debit cards, digital wallets, and cash on delivery."
    },
    {
      "question": "How can I track my order?",
      "answer": "You can track your order in the 'My Orders' section with real-time updates."
    },
    {
      "question": "Can I return or exchange a product?",
      "answer": "Yes, products can be returned or exchanged within 7 days of delivery."
    },
    {
      "question": "How do I contact customer support?",
      "answer": "You can reach our support team via the Help Center or the in-app chat."
    },
  ];

  FaqsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          "FAQs",
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: EdgeInsets.all(16.w),
        child: ListView.separated(
          itemCount: faqs.length,
          separatorBuilder: (context, index) => SizedBox(height: 12.h),
          itemBuilder: (context, index) {
            final faq = faqs[index];
            return Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16.r),
              ),
              elevation: 2,
              child: ExpansionTile(
                tilePadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                childrenPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                title: Text(
                  faq["question"]!,
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                    color: Colors.black87,
                  ),
                ),
                children: [
                  Text(
                    faq["answer"]!,
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: Colors.black54,
                      height: 1.4,
                    ),
                  )
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
