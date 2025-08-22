// rate_input_screen.dart
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io'; // needed for File

class RateInputScreen extends StatefulWidget {
  final String productName;

  const RateInputScreen({super.key, required this.productName});

  @override
  State<RateInputScreen> createState() => _RateInputScreenState();
}

class _RateInputScreenState extends State<RateInputScreen> {
  int _rating = 0;
  final TextEditingController _commentController = TextEditingController();
  List<XFile> _images = [];

  final ImagePicker _picker = ImagePicker();

  void _pickImages() async {
    final List<XFile>? selected = await _picker.pickMultiImage();
    if (selected != null) {
      setState(() {
        _images.addAll(selected);
      });
    }
  }

  void _submitReview() {
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please select a star rating")),
      );
      return;
    }

    // Handle sending data to your backend here

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Review Submitted"),
        content: const Text("Thank you for your feedback!"),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // close popup
              Navigator.pop(context); // go back to previous screen
            },
            child: const Text("OK"),
          ),
        ],
      ),
    );
  }

  Widget _buildStar(int index) {
    return IconButton(
      onPressed: () {
        setState(() {
          _rating = index + 1;
        });
      },
      icon: Icon(
        index < _rating ? Icons.star : Icons.star_border,
        color: Colors.amber,
        size: 32,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Rate ${widget.productName}'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            const Text(
              "Star Rating",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Row(
              children: List.generate(5, (index) => _buildStar(index)),
            ),
            const SizedBox(height: 16),
            const Text(
              "Comment",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            TextField(
              controller: _commentController,
              maxLines: 4,
              decoration: const InputDecoration(
                hintText: "Write your comment here...",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              "Add Pictures",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ..._images.map((img) => Stack(
                      children: [
                        Image.file(
                          File(img.path),
                          width: 80,
                          height: 80,
                          fit: BoxFit.cover,
                        ),
                        Positioned(
                          right: 0,
                          top: 0,
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _images.remove(img);
                              });
                            },
                            child: const Icon(
                              Icons.cancel,
                              color: Colors.red,
                            ),
                          ),
                        )
                      ],
                    )),
                GestureDetector(
                  onTap: _pickImages,
                  child: Container(
                    width: 80,
                    height: 80,
                    color: Colors.grey[200],
                    child: const Icon(Icons.add_a_photo, color: Colors.grey),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _submitReview,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: const Text(
                "Submit Review",
                style: TextStyle(fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
