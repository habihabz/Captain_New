class ProductReview {
  final int id;
  final int productId;
  final int rating;
  final String headline;
  final String review;
  final int createdBy;
  final String createdByName;
  final DateTime createdOn;

  ProductReview({
    this.id = 0,
    required this.productId,
    this.rating = 5,
    this.headline = '',
    this.review = '',
    this.createdBy = 0,
    this.createdByName = '',
    DateTime? createdOn,
  }) : createdOn = createdOn ?? DateTime.now();

  factory ProductReview.fromJson(Map<String, dynamic> json) {
    return ProductReview(
      id: json['pr_id'] ?? 0,
      productId: json['pr_prod_id'] ?? 0,
      rating: json['pr_overall_rating'] ?? 5,
      headline: json['pr_head_line'] ?? '',
      review: json['pr_review'] ?? '',
      createdBy: json['pr_cre_by'] ?? 0,
      createdByName: json['pr_cre_by_name'] ?? '',
      createdOn: json['pr_created_on'] != null 
          ? DateTime.parse(json['pr_created_on']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pr_id': id,
      'pr_prod_id': productId,
      'pr_overall_rating': rating,
      'pr_head_line': headline,
      'pr_review': review,
      'pr_cre_by': createdBy,
      'pr_cre_by_name': createdByName,
    };
  }
}
