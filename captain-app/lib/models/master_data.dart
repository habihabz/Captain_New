class MasterData {
  final int md_id;
  final String md_name;
  final String md_type;

  MasterData({
    required this.md_id,
    required this.md_name,
    this.md_type = '',
  });

  factory MasterData.fromJson(Map<String, dynamic> json) {
    return MasterData(
      md_id: json['md_id'] ?? 0,
      md_name: json['md_name'] ?? '',
      md_type: json['md_type'] ?? '',
    );
  }
}
