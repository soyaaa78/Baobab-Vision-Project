import '/widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'suggestion_screen.dart';
import 'package:baobab_vision_project/constants.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class SurveyScreen extends StatefulWidget {
  final String? detectedFaceShape;

  const SurveyScreen({super.key, this.detectedFaceShape});

  @override
  State<SurveyScreen> createState() => _SurveyScreenState();
}

class _SurveyScreenState extends State<SurveyScreen> {
  // New survey fields for sunglasses recommendation
  String? lifestyleActivity;
  String? uvProtectionImportance;
  String? personalStyle;
  String? fitPreference;
  String? occasionUse;
  String? colorPreference;
  bool isLoading = false;
  String? errorMsg;

  Future<void> getRecommendation() async {
    setState(() {
      isLoading = true;
      errorMsg = null;
    });
    try {
      final response = await http.post(
        Uri.parse(
            'https://baobab-vision-project.onrender.com/api/productRoutes/recommend'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'faceShape': widget.detectedFaceShape,
          'lifestyleActivity': lifestyleActivity,
          'uvProtectionImportance': uvProtectionImportance,
          'personalStyle': personalStyle,
          'fitPreference': fitPreference,
          'occasionUse': occasionUse,
          'colorPreference': colorPreference,
        }),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final recommended = data['recommended'];
        // Navigate to SuggestionScreen and pass recommended products
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) =>
                SuggestionScreen(recommendedProducts: recommended),
          ),
        );
      } else {
        setState(() {
          errorMsg = 'Failed to get recommendations.';
        });
      }
    } catch (e) {
      setState(() {
        errorMsg = 'Error: ${e.toString()}';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        title: const Text('Sunglasses Recommendation Survey'),
        backgroundColor: WHITE_COLOR,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CustomText(
                text: 'Perfect!',
                fontSize: ScreenUtil().setSp(24),
                fontWeight: FontWeight.bold,
              ),
              SizedBox(height: ScreenUtil().setHeight(15)),
              CustomText(
                text: 'Face shape detected: ${widget.detectedFaceShape}',
                fontSize: ScreenUtil().setSp(18),
                fontWeight: FontWeight.w600,
                color: Colors.green.shade700,
              ),
              SizedBox(height: ScreenUtil().setHeight(25)),
              const Text(
                "Let's find your perfect sunglasses! Answer a few questions to get personalized recommendations.",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 30),

              // Question 1: Lifestyle & Activity Preferences
              const Text(
                "1. What's your primary outdoor activity or lifestyle?",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              DropdownButton<String>(
                value: lifestyleActivity,
                hint: const Text("Select your primary activity"),
                isExpanded: true,
                dropdownColor: WHITE_COLOR,
                items: [
                  "Sports/Outdoor Adventures",
                  "Relaxed Outings",
                  "Travel/Exploring",
                  "Fashion/Statement"
                ].map((value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    lifestyleActivity = value;
                  });
                },
              ),
              const SizedBox(height: 25),

              // Question 2: UV Protection and Comfort
              const Text(
                "2. How important is UV protection for your sunglasses?",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              DropdownButton<String>(
                value: uvProtectionImportance,
                hint: const Text("Select importance level"),
                isExpanded: true,
                dropdownColor: WHITE_COLOR,
                items: [
                  "Very Important",
                  "Somewhat Important",
                  "Not Very Important"
                ].map((value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    uvProtectionImportance = value;
                  });
                },
              ),
              const SizedBox(height: 25),

              // Question 3: Personal Style Preferences
              const Text(
                "3. What's your personal style vibe when it comes to sunglasses?",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              DropdownButton<String>(
                value: personalStyle,
                hint: const Text("Select your style"),
                isExpanded: true,
                dropdownColor: WHITE_COLOR,
                items: [
                  "Classic & Timeless",
                  "Bold & Trendy",
                  "Sporty & Functional",
                  "Minimalist"
                ].map((value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    personalStyle = value;
                  });
                },
              ),
              const SizedBox(height: 25),

              // Question 4: Fit & Comfort
              const Text(
                "4. How do you feel about the fit of your sunglasses?",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              DropdownButton<String>(
                value: fitPreference,
                hint: const Text("Select your fit preference"),
                isExpanded: true,
                dropdownColor: WHITE_COLOR,
                items: [
                  "I need a snug fit",
                  "I prefer a more relaxed, loose fit",
                  "I like a mix of both"
                ].map((value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    fitPreference = value;
                  });
                },
              ),
              const SizedBox(height: 25),

              // Question 5: Occasion/Use Case
              const Text(
                "5. When do you mostly wear sunglasses?",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              DropdownButton<String>(
                value: occasionUse,
                hint: const Text("Select primary use case"),
                isExpanded: true,
                dropdownColor: WHITE_COLOR,
                items: [
                  "Daily, All Day Wear",
                  "Special Occasions/Outings",
                  "Driving or Commuting",
                  "Sport/Activity-Specific"
                ].map((value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    occasionUse = value;
                  });
                },
              ),
              const SizedBox(height: 25),

              // Question 6: Color Preferences in Accessories
              const Text(
                "6. What's your preferred color palette when it comes to accessories?",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 10),
              DropdownButton<String>(
                value: colorPreference,
                hint: const Text("Select your color preference"),
                isExpanded: true,
                dropdownColor: WHITE_COLOR,
                items: [
                  "Neutral & Classic",
                  "Bold & Vibrant",
                  "Earthy & Natural",
                  "Metallic & Sleek"
                ].map((value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    colorPreference = value;
                  });
                },
              ),
              const SizedBox(height: 30),

              if (errorMsg != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(
                    errorMsg!,
                    style: TextStyle(color: Colors.red.shade700),
                  ),
                ),
                const SizedBox(height: 20),
              ],

              if (isLoading)
                const Center(
                  child: Column(
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 10),
                      Text("Finding your perfect sunglasses...")
                    ],
                  ),
                ),

              const SizedBox(height: 30),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: (isLoading ||
                          lifestyleActivity == null ||
                          uvProtectionImportance == null ||
                          personalStyle == null ||
                          fitPreference == null ||
                          occasionUse == null ||
                          colorPreference == null)
                      ? null
                      : getRecommendation,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF252525),
                    foregroundColor: const Color(0xFFFCF7F2),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    isLoading
                        ? "Getting Recommendations..."
                        : "Get My Perfect Sunglasses",
                    style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
