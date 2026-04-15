import 'package:flutter/material.dart';
import '../models/favourite.dart';
import '../models/db_result.dart';
import '../services/favourite_service.dart';

class FavouriteProvider with ChangeNotifier {
  final FavouriteService _favouriteService = FavouriteService();
  List<Favourite> _favourites = [];
  bool _isLoading = false;

  List<Favourite> get favourites => _favourites;
  bool get isLoading => _isLoading;

  Future<void> fetchFavourites(int customerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      _favourites = await _favouriteService.getFavourites(customerId);
    } catch (e) {
      debugPrint('Error fetching favourites: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  bool isFavourite(int productId) {
    return _favourites.any((f) => f.productId == productId);
  }

  Future<DbResult> toggleFavourite(int productId, int customerId, String customerName) async {
    final existing = _favourites.firstWhere(
      (f) => f.productId == productId, 
      orElse: () => Favourite(id: 0, productId: productId)
    );

    if (existing.id != 0) {
      // It exists, so we delete it (standard toggle behavior)
      final result = await _favouriteService.deleteFavourite(existing.id);
      if (result.status) {
        _favourites.removeWhere((f) => f.id == existing.id);
        notifyListeners();
      }
      return result;
    } else {
      // It doesn't exist, so create it
      final newFav = Favourite(
        productId: productId,
        createdBy: customerId,
        createdByName: customerName,
      );
      final result = await _favouriteService.toggleFavourite(newFav);
      if (result.status) {
        await fetchFavourites(customerId);
      }
      return result;
    }
  }

  Future<void> removeFavourite(int id, int customerId) async {
    final result = await _favouriteService.deleteFavourite(id);
    if (result.status) {
      _favourites.removeWhere((f) => f.id == id);
      notifyListeners();
    }
  }
}
