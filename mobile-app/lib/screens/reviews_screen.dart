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
        elevation: 0,
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
          if (_loading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 4),
              child: LinearProgressIndicator(minHeight: 2),
            ),

          // 🔽 Filter row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterButton("All"),
                const SizedBox(width: 8),
                _buildFilterButton("With Media", badge: _withMedia),
                const SizedBox(width: 8),
                _buildFilterButton("By Stars"),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // 🔽 Star filter row if By Stars
          if (selectedFilter == "By Stars")
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: List.generate(5, (i) {
                int star = 5 - i;
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
                      color: selectedStar == star
                          ? Colors.black
                          : Colors.grey[100],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                          color: selectedStar == star
                              ? Colors.black
                              : Colors.grey[300]!),
                      boxShadow: selectedStar == star
                          ? [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.1),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              )
                            ]
                          : null,
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

          const SizedBox(height: 16),

          CustomText(
            text: "${filteredReviews.length} Reviews",
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),

          const SizedBox(height: 16),

          // 🔽 Reviews list
          if (filteredReviews.isEmpty)
            const Center(
                child: Text(
              "No reviews found.",
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ))
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

  Widget _buildFilterButton(String label, {int badge = 0}) {
    final bool isSelected = selectedFilter == label;
    return GestureDetector(
      onTap: () {
        setState(() {
          selectedFilter = label;
          if (label != "By Stars") selectedStar = 0;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  colors: [Colors.black, Colors.grey],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isSelected ? null : Colors.grey[100],
          borderRadius: BorderRadius.circular(30),
          border:
              Border.all(color: isSelected ? Colors.black : Colors.grey[300]!),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 6,
                      offset: const Offset(0, 3))
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.black,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (badge > 0) ...[
              const SizedBox(width: 6),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: isSelected ? Colors.white : Colors.black,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badge.toString(),
                  style: TextStyle(
                    color: isSelected ? Colors.black : Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
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
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Profile + Username + Stars
          Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundImage: NetworkImage(profilePic),
              ),
              const SizedBox(width: 12),
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
          const SizedBox(height: 12),

          // Review text
          CustomText(
            text: reviewText,
            fontSize: 14,
          ),

          const SizedBox(height: 10),

          // Photos
          if (photos.isNotEmpty)
            SizedBox(
              height: 90,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: photos.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  return GestureDetector(
                    onTap: () {
                      _showPhotoViewer(context, photos[index]);
                    },
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.network(
                        photos[index],
                        width: 90,
                        height: 90,
                        fit: BoxFit.cover,
                      ),
                    ),
                  );
                },
              ),
            ),

          // Admin Response
          if (adminResponse != null && adminResponse.isNotEmpty) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: BLACK_COLOR!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const SizedBox(width: 3),
                      CustomText(
                        text: "Baobab Eyewear",
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: BLACK_COLOR
                      ),
                      if (respondedAt != null) ...[
                        const SizedBox(width: 8),
                        CustomText(
                          text: "• ${_formatDate(respondedAt)}",
                          fontSize: 12,
                          color: BLACK_COLOR,
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