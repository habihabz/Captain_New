class ProductReview {
  final int pr_id;
  final int pr_prod_id;
  final int pr_overall_rating;
  final String pr_head_line;
  final String pr_review;
  final int pr_cre_by;
  final String pr_cre_by_name;
  final DateTime pr_created_on;

  ProductReview({
    this.pr_id = 0,
    required this.pr_prod_id,
    this.pr_overall_rating = 5,
    this.pr_head_line = '',
    this.pr_review = '',
    this.pr_cre_by = 0,
    this.pr_cre_by_name = '',
    DateTime? pr_created_on,
  }) : pr_created_on = pr_created_on ?? DateTime.now();

  factory ProductReview.fromJson(Map<String, dynamic> json) {
    return ProductReview(
      pr_id: json['pr_id'] ?? 0,
      pr_prod_id: json['pr_prod_id'] ?? 0,
      pr_overall_rating: json['pr_overall_rating'] ?? 5,
      pr_head_line: json['pr_head_line'] ?? '',
      pr_review: json['pr_review'] ?? '',
      pr_cre_by: json['pr_cre_by'] ?? 0,
      pr_cre_by_name: json['pr_cre_by_name'] ?? '',
      pr_created_on: json['pr_created_on'] != null 
          ? DateTime.parse(json['pr_created_on']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'pr_id': pr_id,
      'pr_prod_id': pr_prod_id,
      'pr_overall_rating': pr_overall_rating,
      'pr_head_line': pr_head_line,
      'pr_review': pr_review,
      'pr_cre_by': pr_cre_by,
      'pr_cre_by_name': pr_cre_by_name,
    };
  }
}
