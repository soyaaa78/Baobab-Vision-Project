import 'package:flutter/material.dart';
import '../widgets/custom_text.dart';
import '../constants.dart';

class ReviewsScreen extends StatefulWidget {
  final ScrollController? scrollController;

  const ReviewsScreen({super.key, this.scrollController});

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  String selectedFilter = "All"; // Default filter
  int selectedStar = 0; // For "By Stars" filter (0 = none)

  // Sample reviews
  final List<Map<String, dynamic>> reviews = [
    {
      "profilePic": "https://via.placeholder.com/150",
      "username": "beverly",
      "stars": 5,
      "reviewText": "The product is amazing! Great quality and fast delivery.",
      "photos": [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCK_qA4U1yOMCE2XqBS0m2F3ohYKROqq2u3Q&s",
        "https://img.lazcdn.com/g/p/981d2288222c65f41fd7ae726e74c5ad.jpg_720x720q80.jpg"
      ],
    },
    {
      "profilePic": "https://via.placeholder.com/150",
      "username": "michael",
      "stars": 4,
      "reviewText": "Good product but the packaging could be better.",
      "photos": [],
    },
  ];

  String maskUsername(String username) {
    if (username.length <= 2) return username;
    return username[0] +
        "*" * (username.length - 2) +
        username[username.length - 1];
  }

  // 🔽 Filtered reviews logic
  List<Map<String, dynamic>> get filteredReviews {
    if (selectedFilter == "With Media") {
      return reviews.where((r) => r["photos"].isNotEmpty).toList();
    } else if (selectedFilter == "By Stars" && selectedStar > 0) {
      return reviews.where((r) => r["stars"] == selectedStar).toList();
    }
    return reviews;
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
          // 🔽 Sort By row
          Row(
            children: [
              _buildFilterButton("All"),
              const SizedBox(width: 8),
              _buildFilterButton("With Media"),
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
                int count =
                    reviews.where((r) => r["stars"] == star).toList().length;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      selectedStar = star;
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
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
                ),
              ),
            ),
        ],
      ),
    );
  }

  // 🔽 Custom Filter Button (instead of ChoiceChip)
  Widget _buildFilterButton(String label) {
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
          border: Border.all(
              color: isSelected ? Colors.black : Colors.grey[300]!),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black,
            fontWeight: FontWeight.w500,
          ),
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
}