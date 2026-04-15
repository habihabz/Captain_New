class DbResult {
  final String message;
  final bool status;
  final int id;

  DbResult({
    required this.message,
    required this.status,
    this.id = 0,
  });

  factory DbResult.fromJson(Map<String, dynamic> json) {
    // Some backend endpoints don't return an explicit 'status' boolean.
    // We infer success if 'status' is true OR if the message is 'Success' or 'SUCCESS'.
    bool inferredStatus = json['status'] ?? false;
    
    if (!inferredStatus && json['message'] != null) {
      final msg = json['message'].toString().toLowerCase();
      if (msg == 'success' || msg.contains('successfully')) {
        inferredStatus = true;
      }
    }

    // Also check if id > 0 (creation usually returns the new ID)
    if (!inferredStatus && (json['id'] ?? 0) > 0) {
      inferredStatus = true;
    }

    return DbResult(
      message: json['message'] ?? '',
      status: inferredStatus,
      id: json['id'] ?? 0,
    );
  }
}
