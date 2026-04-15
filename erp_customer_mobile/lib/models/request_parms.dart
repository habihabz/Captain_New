class RequestParms {
  int id;
  String name;
  String type;
  int country;
  String details;
  int user;
  int status;
  int color;
  String others;
  double amount;
  String paymentId;
  String startDate;
  String endDate;
  String completedYn;
  String refundId;

  RequestParms({
    this.id = 0,
    this.name = '',
    this.type = '',
    this.country = 0,
    this.details = '',
    this.user = 0,
    this.status = 0,
    this.color = 0,
    this.others = '',
    this.amount = 0.0,
    this.paymentId = '',
    this.startDate = '',
    this.endDate = '',
    this.completedYn = 'N',
    this.refundId = '',
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'country': country,
      'details': details,
      'user': user,
      'status': status,
      'color': color,
      'others': others,
      'amount': amount,
      'paymentId': paymentId,
      'startDate': startDate,
      'endDate': endDate,
      'completedYn': completedYn,
      'refundId': refundId,
    };
  }
}

class ProductSearchParms {
  int id;
  String categories;
  String subcategories;
  String divisions;
  String subdivisions;
  String sizes;
  String orderBy;
  int country;

  ProductSearchParms({
    this.id = 0,
    this.categories = '',
    this.subcategories = '',
    this.divisions = '',
    this.subdivisions = '',
    this.sizes = '',
    this.orderBy = '',
    this.country = 1, // Defaulting to 1 for prices
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'categories': categories,
      'subcategories': subcategories,
      'divisions': divisions,
      'subdivisions': subdivisions,
      'sizes': sizes,
      'orderBy': orderBy,
      'country': country,
    };
  }
}
