class OrderMovementHistory {
  final int omh_id;
  final int? omh_order_no;
  final int? omh_status;
  final String? omh_status_name;
  final int? omh_workflow_id;
  final int? omh_cre_by;
  final String? omh_cre_by_name;
  final DateTime? omh_cre_date;

  OrderMovementHistory({
    required this.omh_id,
    this.omh_order_no,
    this.omh_status,
    this.omh_status_name,
    this.omh_workflow_id,
    this.omh_cre_by,
    this.omh_cre_by_name,
    this.omh_cre_date,
  });

  factory OrderMovementHistory.fromJson(Map<String, dynamic> json) {
    return OrderMovementHistory(
      omh_id: json['omh_id'] ?? 0,
      omh_order_no: json['omh_order_no'],
      omh_status: json['omh_status'],
      omh_status_name: json['omh_status_name'],
      omh_workflow_id: json['omh_workflow_id'],
      omh_cre_by: json['omh_cre_by'],
      omh_cre_by_name: json['omh_cre_by_name'],
      omh_cre_date: json['omh_cre_date'] != null ? DateTime.parse(json['omh_cre_date']) : null,
    );
  }
}
