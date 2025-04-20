import '/widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'suggestion_screen.dart';
import 'package:aniasco_long_exam1/constants.dart';

class SurveyScreen extends StatefulWidget {
  final String? detectedFaceShape;

  const SurveyScreen({super.key, this.detectedFaceShape});

  @override
  State<SurveyScreen> createState() => _SurveyScreenState();
}

class _SurveyScreenState extends State<SurveyScreen> {
  String? lifestyle;
  String? occasion;
  String? eyeglassStyle; // Separate variable for eyeglass style dropdown

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        title: const Text('Eyewear Recommender'),
        backgroundColor: WHITE_COLOR,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CustomText(
                text: 'Great!',
                fontSize: ScreenUtil().setSp(24),
                fontWeight: FontWeight.bold,
              ),
              SizedBox(height: ScreenUtil().setHeight(25)),
              CustomText(
                text: 'Your face has been successfully classified as: ${widget.detectedFaceShape}',
                fontSize: ScreenUtil().setSp(24),
                fontWeight: FontWeight.bold,
              ),
              SizedBox(height: ScreenUtil().setHeight(25)),
              if (widget.detectedFaceShape != null) ...[
                const SizedBox(height: 20),
                const Text(
                  "Now for the personal nitty-gritty stuff.",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
              const SizedBox(height: 20),
              const Text(
                "What would you say your personal \"style\" is?",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              DropdownButton<String>(
                value: lifestyle,
                hint: const Text("Select your lifestyle"),
                isExpanded: true,
                dropdownColor: WHITE_COLOR,
                items: ["Minimalist", "Classic", "Bold", "Trendy", "Eccentric"].map((value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    lifestyle = value;
                  });
                },
              ),
              const SizedBox(height: 20),
              const Text(
                "What kind of occasion is this for?",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              DropdownButton<String>(
                value: occasion,
                hint: const Text("Select the occasion"),
                isExpanded: true,
                dropdownColor: WHITE_COLOR,
                items: ["For the day-to-day", "Work", "Outdoor activities", "Sports", "Partying"].map((value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    occasion = value;
                  });
                },
              ),
              const SizedBox(height: 20),
              const Text(
                "What style of eyeglass do you usually go for?",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              DropdownButton<String>(
                value: eyeglassStyle, // Corrected variable
                hint: const Text("Select your style"),
                isExpanded: true,
                dropdownColor: WHITE_COLOR,
                items: ["Casual", "Formal", "Sporty", "Trendy"].map((value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: Text(value),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    eyeglassStyle = value; // Updating the correct variable
                  });
                },
              ),
              const SizedBox(height: 60),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  SizedBox(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const SuggestionScreen(),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF252525),
                        foregroundColor: const Color(0xFFFCF7F2),
                      ),
                      child: const Text("Get Recommendation"),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
