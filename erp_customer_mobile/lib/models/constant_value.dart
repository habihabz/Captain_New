class ConstantValue {
  final int cv_id;
  final String cv_name;
  final String cv_value;
  final String cv_type;

  ConstantValue({
    this.cv_id = 0,
    this.cv_name = '',
    this.cv_value = '',
    this.cv_type = '',
  });

  factory ConstantValue.fromJson(Map<String, dynamic> json) {
    return ConstantValue(
      cv_id: json['cv_id'] ?? 0,
      cv_name: json['cv_name'] ?? '',
      cv_value: json['cv_value'] ?? '',
      cv_type: json['cv_type'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'cv_id': cv_id,
    'cv_name': cv_name,
    'cv_value': cv_value,
    'cv_type': cv_type,
  };
}
