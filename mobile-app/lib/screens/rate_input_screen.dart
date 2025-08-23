// rate_input_screen.dart
import 'dart:convert';
import 'dart:io';

import 'package:baobab_vision_project/services/api_client.dart';
import 'package:baobab_vision_project/services/auth_storage.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class RateInputScreen extends StatefulWidget {
  final String productName;
  final String orderId;

  const RateInputScreen({
    super.key,
    required this.productName,
    required this.orderId,
  });

  @override
  State<RateInputScreen> createState() => _RateInputScreenState();
}

class _RateInputScreenState extends State<RateInputScreen> {
  int _rating = 0;
  final TextEditingController _commentController = TextEditingController();
  List<XFile> _images = [];
  bool _submitting = false;

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
        const SnackBar(content: Text('Please select a star rating')),
      );
      return;
    }

    () async {
      try {
        setState(() => _submitting = true);
        final userId = await AuthStorage.getUserId();
        if (userId == null || userId.isEmpty) {
          throw Exception('Not authenticated');
        }

        // 1) Upload images if any
        List<String> pictureUrls = [];
        if (_images.isNotEmpty) {
          final files = _images.map((x) => File(x.path)).toList();
          final resp = await ApiClient.uploadMultipleFiles(
            '/api/storage/upload/rating-pictures',
            'ratingPictures',
            files,
          );
          if (resp.statusCode != 200) {
            throw Exception('Failed to upload images');
          }
          final body = json.decode(resp.body) as Map<String, dynamic>;
          final urlsRaw = body['urls'];
          if (urlsRaw is List) {
            pictureUrls = urlsRaw.whereType<String>().toList();
          }
        }

        // 2) Submit rating
        final response = await ApiClient.postJson('/api/ratings', {
          'userId': userId,
          'orderId': widget.orderId,
          'rating': _rating,
          'comment': _commentController.text.trim(),
          if (pictureUrls.isNotEmpty) 'pictures': pictureUrls,
        });
        if (response.statusCode != 201) {
          final msg = () {
            try {
              final m = json.decode(response.body);
              return m is Map<String, dynamic>
                  ? (m['message']?.toString() ?? 'Failed to submit review')
                  : 'Failed to submit review';
            } catch (_) {
              return 'Failed to submit review';
            }
          }();
          throw Exception(msg);
        }

        if (!mounted) return;
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Review Submitted'),
            content: const Text('Thank you for your feedback!'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // close popup
                  Navigator.pop(context); // go back to previous screen
                },
                child: const Text('OK'),
              ),
            ],
          ),
        );
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      } finally {
        if (mounted) setState(() => _submitting = false);
      }
    }();
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
              onPressed: _submitting ? null : _submitReview,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              child: _submitting
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text(
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
