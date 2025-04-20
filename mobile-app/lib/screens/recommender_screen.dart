import 'package:baobab_vision_project/constants.dart';
import 'package:baobab_vision_project/screens/survey_screen.dart';
import 'package:baobab_vision_project/widgets/custom_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:delayed_display/delayed_display.dart';

class RecommenderScreen extends StatefulWidget {
  const RecommenderScreen({super.key});

  @override
  State<RecommenderScreen> createState() => _RecommenderScreenState();
}

class _RecommenderScreenState extends State<RecommenderScreen> {
  bool showQuestionnaire = false;
  String? detectedFaceShape;

  final List<String> faceShapes = ["Oval", "Round", "Square", "Heart", "Diamond"];

  
  void classifyFaceShape() {
    setState(() {
      detectedFaceShape = faceShapes[0]; // Mocked classification result
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(title: const Text('Eyewear Recommender'), backgroundColor: WHITE_COLOR,),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 500,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  image: const DecorationImage(
                    image: AssetImage("assets/images/neutralface.jpg"),
                    fit: BoxFit.cover,
                  ),
                ),
                alignment: Alignment.center,
              ),
              SizedBox(height: ScreenUtil().setHeight(5)),
              CustomText(
                text: 'Hang tight and look straight into the camera. We don\'t want to mess up your recommendation!',
                fontSize: ScreenUtil().setSp(12),
                color: Colors.grey,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: ScreenUtil().setHeight(80)),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  DelayedDisplay( // delayed display to emulate how much time will elapse when facial data is being processed
                  delay: const Duration(seconds: 2),
                    child: SizedBox(
                      child: ElevatedButton(
                        onPressed: () {
                          classifyFaceShape();
                          Navigator.push(context, MaterialPageRoute(builder: (context) => SurveyScreen(detectedFaceShape: detectedFaceShape)));
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF252525),
                          foregroundColor: const Color(0xFFFCF7F2),
                        ),
                        child: const Text("Next"),
                      ),
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