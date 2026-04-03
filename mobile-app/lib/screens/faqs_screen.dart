import 'package:baobab_vision_project/constants.dart';
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
      backgroundColor: Colors.grey[100], // subtle background
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        centerTitle: true,
        title: Text(
          "Frequently Ask Questions",
          style: TextStyle(
            fontSize: 20.sp,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        child: ListView.separated(
          physics: BouncingScrollPhysics(),
          itemCount: faqs.length,
          separatorBuilder: (context, index) => SizedBox(height: 12.h),
          itemBuilder: (context, index) {
            final faq = faqs[index];
            return _FaqItem(
              question: faq["question"]!,
              answer: faq["answer"]!,
            );
          },
        ),
      ),
    );
  }
}

class _FaqItem extends StatefulWidget {
  final String question;
  final String answer;

  const _FaqItem({
    required this.question,
    required this.answer,
    Key? key,
  }) : super(key: key);

  @override
  State<_FaqItem> createState() => _FaqItemState();
}

class _FaqItemState extends State<_FaqItem> with SingleTickerProviderStateMixin {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: WHITE_COLOR,
      elevation: 3,
      shadowColor: Colors.black12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16.r),
        side: BorderSide(
          color: BLACK_COLOR,
          width: 1,
        )
      ),
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
          childrenPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
          onExpansionChanged: (expanded) {
            setState(() {
              _isExpanded = expanded;
            });
          },
          trailing: AnimatedRotation(
            turns: _isExpanded ? 0.5 : 0.0, // rotates the icon
            duration: Duration(milliseconds: 200),
            child: Icon(
              Icons.keyboard_arrow_down_rounded,
              size: 24.sp,
              color: Colors.black54,
            ),
          ),
          title: Text(
            widget.question,
            style: TextStyle(
              fontSize: 16.sp,
              fontWeight: FontWeight.w600,
              color: Colors.black87,
            ),
          ),
          children: [
            Text(
              widget.answer,
              style: TextStyle(
                fontSize: 14.sp,
                color: Colors.black54,
                height: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}