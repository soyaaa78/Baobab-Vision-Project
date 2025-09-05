import 'dart:convert';
import 'dart:io';
import 'package:baobab_vision_project/constants.dart';
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

        // Upload images
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

        // Submit rating
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
                  Navigator.pop(context);
                  Navigator.pop(context);
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
        size: 36,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR, // 🌟 Background color
      appBar: AppBar(
        title: Text(
          'Rate ${widget.productName}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
        elevation: 1,
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            const Text(
              "Star Rating",
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 18,
                color: Colors.black87,
              ),
            ),
            Row(
              children: List.generate(5, (index) => _buildStar(index)),
            ),
            const SizedBox(height: 20),
            const Text(
              "Comment",
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 18,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _commentController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: "Write your comment here...",
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.all(12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              "Add Pictures",
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 18,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ..._images.map((img) => ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Stack(
                        children: [
                          Image.file(
                            File(img.path),
                            width: 90,
                            height: 90,
                            fit: BoxFit.cover,
                          ),
                          Positioned(
                            right: 4,
                            top: 4,
                            child: GestureDetector(
                              onTap: () {
                                setState(() {
                                  _images.remove(img);
                                });
                              },
                              child: Container(
                                decoration: const BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.black54,
                                ),
                                padding: const EdgeInsets.all(2),
                                child: const Icon(
                                  Icons.close,
                                  size: 18,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          )
                        ],
                      ),
                    )),
                GestureDetector(
                  onTap: _pickImages,
                  child: Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: Colors.grey.shade300),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.add_a_photo, color: Colors.grey),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _submitting ? null : _submitReview,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black87, // 🌟 Button color
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 2,
                ),
                child: _submitting
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        "Submit Review",
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}