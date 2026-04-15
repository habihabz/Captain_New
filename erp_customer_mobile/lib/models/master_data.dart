class MasterData {
  final int id;
  final String name;
  final String type;

  MasterData({
    required this.id,
    required this.name,
    this.type = '',
  });

  factory MasterData.fromJson(Map<String, dynamic> json) {
    return MasterData(
      id: json['md_id'] ?? 0,
      name: json['md_name'] ?? '',
      type: json['md_type'] ?? '',
    );
  }
}
