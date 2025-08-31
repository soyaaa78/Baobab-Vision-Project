import 'dart:convert';
import 'package:flutter/material.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';
import 'package:baobab_vision_project/services/api_client.dart';

class ReviewsScreen extends StatefulWidget {
  final ScrollController? scrollController;
  final String productId;

  const ReviewsScreen(
      {super.key, this.scrollController, required this.productId});

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  String selectedFilter = "All"; // Default filter
  int selectedStar = 0; // For "By Stars" filter (0 = none)
  List<Map<String, dynamic>> _reviews = [];
  bool _loading = false;
  Map<int, int> _starCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
  int _withMedia = 0;

  @override
  void initState() {
    super.initState();
    _fetchReviewsAndStats();
  }

  String maskUsername(String username) {
    if (username.length <= 2) return username;
    return username[0] +
        "*" * (username.length - 2) +
        username[username.length - 1];
  }

  // 🔽 Filtered reviews logic
  List<Map<String, dynamic>> get filteredReviews {
    if (selectedFilter == "With Media") {
      return _reviews.where((r) => (r["photos"] as List).isNotEmpty).toList();
    } else if (selectedFilter == "By Stars" && selectedStar > 0) {
      return _reviews.where((r) => r["stars"] == selectedStar).toList();
    }
    return _reviews;
  }

  Future<void> _fetchReviewsAndStats() async {
    setState(() => _loading = true);
    try {
      final resp =
          await ApiClient.get('/api/products/${widget.productId}/reviews');
      if (resp.statusCode == 200) {
        final body = json.decode(resp.body) as Map<String, dynamic>;
        final items =
            (body['reviews'] as List<dynamic>).cast<Map<String, dynamic>>();
        _reviews = items.map((r) {
          final user = r['user'] as Map<String, dynamic>? ?? {};
          return {
            'profilePic': (user['profileImage'] as String?)?.isNotEmpty == true
                ? user['profileImage']
                : 'https://via.placeholder.com/150',
            'username': (user['username'] ?? 'user').toString(),
            'stars': (r['rating'] as num?)?.toInt() ?? 0,
            'reviewText': r['comment'] ?? '',
            'photos': List<String>.from(r['pictures'] ?? []),
            'adminResponse': r['adminResponse'] as String?,
            'respondedAt': r['respondedAt'] as String?,
          };
        }).toList();
        final stats = (body['stats'] as Map<String, dynamic>?);
        if (stats != null) {
          _starCounts = {
            1: (stats['distribution']?['1'] ?? 0) as int,
            2: (stats['distribution']?['2'] ?? 0) as int,
            3: (stats['distribution']?['3'] ?? 0) as int,
            4: (stats['distribution']?['4'] ?? 0) as int,
            5: (stats['distribution']?['5'] ?? 0) as int,
          };
          _withMedia = (stats['withMedia'] ?? 0) as int;
        }
      }
    } catch (_) {
      // swallow
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WHITE_COLOR,
      appBar: AppBar(
        backgroundColor: WHITE_COLOR,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const CustomText(
          text: 'Reviews',
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
        centerTitle: true,
      ),
      body: ListView(
        controller: widget.scrollController,
        padding: const EdgeInsets.all(16),
        children: [
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          // 🔽 Sort By row
          Row(
            children: [
              _buildFilterButton("All"),
              const SizedBox(width: 8),
              _buildFilterButton("With Media", badge: _withMedia),
              const SizedBox(width: 8),
              _buildFilterButton("By Stars"),
            ],
          ),

          const SizedBox(height: 8),

          // 🔽 If "By Stars" is selected, show star filter row
          if (selectedFilter == "By Stars")
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: List.generate(5, (i) {
                int star = 5 - i; // Start from 5 stars down to 1
                int count = _starCounts[star] ?? 0;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      selectedStar = star;
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      color: selectedStar == star
                          ? Colors.black
                          : Colors.grey[100],
                      border: Border.all(
                          color: selectedStar == star
                              ? Colors.black
                              : Colors.grey[300]!),
                    ),
                    child: Row(
                      children: [
                        Row(
                          children: List.generate(
                            star,
                            (index) => const Icon(Icons.star,
                                size: 18, color: Colors.amber),
                          ),
                        ),
                        const SizedBox(width: 8),
                        CustomText(
                          text: "($count)",
                          fontSize: 14,
                          color: selectedStar == star
                              ? Colors.white
                              : Colors.black,
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),

          const SizedBox(height: 12),

          // 🔽 Show count of reviews
          CustomText(
            text: "${filteredReviews.length} Reviews",
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),

          const SizedBox(height: 16),

          // 🔽 Render reviews
          if (filteredReviews.isEmpty)
            const Center(child: Text("No reviews found."))
          else
            ...filteredReviews.map(
              (review) => Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _buildReviewCard(
                  context,
                  profilePic: review["profilePic"],
                  username: review["username"],
                  stars: review["stars"],
                  reviewText: review["reviewText"],
                  photos: List<String>.from(review["photos"]),
                  adminResponse: review["adminResponse"],
                  respondedAt: review["respondedAt"],
                ),
              ),
            ),
        ],
      ),
    );
  }

  // 🔽 Custom Filter Button (instead of ChoiceChip)
  Widget _buildFilterButton(String label, {int badge = 0}) {
    final bool isSelected = selectedFilter == label;
    return GestureDetector(
      onTap: () {
        setState(() {
          selectedFilter = label;
          if (label != "By Stars") selectedStar = 0; // Reset stars when leaving
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.black : Colors.grey[100],
          borderRadius: BorderRadius.circular(20),
          border:
              Border.all(color: isSelected ? Colors.black : Colors.grey[300]!),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black,
                fontWeight: FontWeight.w500,
              ),
            ),
            if (badge > 0) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white : Colors.black,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badge.toString(),
                  style: TextStyle(
                    color: isSelected ? Colors.black : Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              )
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildReviewCard(
    BuildContext context, {
    required String profilePic,
    required String username,
    required int stars,
    required String reviewText,
    required List<String> photos,
    String? adminResponse,
    String? respondedAt,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Profile + Username + Stars
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundImage: NetworkImage(profilePic),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: CustomText(
                  text: maskUsername(username),
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Row(
                children: List.generate(
                  5,
                  (index) => Icon(
                    index < stars ? Icons.star : Icons.star_border,
                    color: Colors.amber,
                    size: 18,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Review text
          CustomText(
            text: reviewText,
            fontSize: 14,
          ),

          const SizedBox(height: 8),

          // Photos (if any)
          if (photos.isNotEmpty)
            SizedBox(
              height: 80,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: photos.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  return GestureDetector(
                    onTap: () {
                      _showPhotoViewer(context, photos[index]);
                    },
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        photos[index],
                        width: 80,
                        height: 80,
                        fit: BoxFit.cover,
                      ),
                    ),
                  );
                },
              ),
            ),

          // Admin response (if any)
          if (adminResponse != null && adminResponse.isNotEmpty) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.admin_panel_settings,
                        size: 16,
                        color: Colors.blue[600] ?? Colors.blue,
                      ),
                      const SizedBox(width: 6),
                      CustomText(
                        text: "Admin Response",
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.blue[600] ?? Colors.blue,
                      ),
                      if (respondedAt != null) ...[
                        const SizedBox(width: 8),
                        CustomText(
                          text: "• ${_formatDate(respondedAt)}",
                          fontSize: 12,
                          color: Colors.blue[500] ?? Colors.blue,
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 8),
                  CustomText(
                    text: adminResponse,
                    fontSize: 14,
                    color: Colors.grey[800] ?? Colors.grey,
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 8),

          // Like & Dislike
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.thumb_up_alt_outlined, size: 20),
                onPressed: () {},
              ),
              IconButton(
                icon: const Icon(Icons.thumb_down_alt_outlined, size: 20),
                onPressed: () {},
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showPhotoViewer(BuildContext context, String imageUrl) {
    showDialog(
      context: context,
      builder: (_) => Dialog(
        insetPadding: EdgeInsets.zero,
        backgroundColor: Colors.black,
        child: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: InteractiveViewer(
            panEnabled: true,
            minScale: 0.8,
            maxScale: 4,
            child: Center(
              child: Image.network(imageUrl),
            ),
          ),
        ),
      ),
    );
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inDays > 7) {
        return "${date.day}/${date.month}/${date.year}";
      } else if (difference.inDays > 0) {
        return "${difference.inDays}d ago";
      } else if (difference.inHours > 0) {
        return "${difference.inHours}h ago";
      } else if (difference.inMinutes > 0) {
        return "${difference.inMinutes}m ago";
      } else {
        return "Just now";
      }
    } catch (e) {
      return dateString;
    }
  }
}
