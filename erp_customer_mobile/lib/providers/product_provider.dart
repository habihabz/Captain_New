import 'package:flutter/material.dart';
import '../models/category.dart';
import '../models/product.dart';
import '../models/master_data.dart';
import '../models/request_parms.dart';
import '../services/product_service.dart';
import '../services/master_data_service.dart';

class ProductProvider with ChangeNotifier {
  final ProductService _productService = ProductService();
  final MasterDataService _masterDataService = MasterDataService();
  
  List<Product> _products = [];
  List<Category> _categories = [];
  
  // Advanced filters
  List<MasterData> _subcategories = [];
  List<MasterData> _divisions = [];
  List<MasterData> _sizes = [];

  // Selected filters
  final List<int> _selectedSubCategoryIds = [];
  final List<int> _selectedDivisionIds = [];
  final List<int> _selectedSizeIds = [];
  int _selectedCategoryId = 0;
  String _searchQuery = '';

  bool _isLoading = false;
  int _selectedCountryId = 1;

  List<Product> get products => _products;
  List<Category> get categories => _categories;
  List<MasterData> get subcategories => _subcategories;
  List<MasterData> get divisions => _divisions;
  List<MasterData> get sizes => _sizes;
  bool get isLoading => _isLoading;
  
  int get selectedCategoryId => _selectedCategoryId;
  List<int> get selectedSubCategoryIds => _selectedSubCategoryIds;
  List<int> get selectedDivisionIds => _selectedDivisionIds;
  List<int> get selectedSizeIds => _selectedSizeIds;

  int get selectedCountryId => _selectedCountryId;
  bool _isCountryInitialized = false;

  void setCountryId(int id) {
    _selectedCountryId = id;
    _isCountryInitialized = true;
    notifyListeners();
  }

  Future<void> initializeSettings() async {
    if (_isCountryInitialized) return;
    final id = await _masterDataService.getCountryIdByName('India');
    if (id != 0) {
      _selectedCountryId = id;
      _isCountryInitialized = true;
    }
  }

  Future<void> fetchHomeData() async {
    _isLoading = true;
    notifyListeners();

    try {
      await initializeSettings();
      
      final results = await Future.wait([
        _productService.getProductsByCountry(_selectedCountryId),
        _productService.getCategories(),
        _masterDataService.getMasterDatasByType('SubCategory'),
        _masterDataService.getMasterDatasByType('Division'),
        _masterDataService.getMasterDatasByType('ProductSize'),
      ]);

      _products = results[0] as List<Product>;
      _categories = results[1] as List<Category>;
      _subcategories = results[2] as List<MasterData>;
      _divisions = results[3] as List<MasterData>;
      _sizes = results[4] as List<MasterData>;
    } catch (e) {
      debugPrint('Error fetching data: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setCategory(int id) {
    _selectedCategoryId = id;
    applyFilters();
  }

  void toggleSubCategory(int id) {
    if (_selectedSubCategoryIds.contains(id)) {
      _selectedSubCategoryIds.remove(id);
    } else {
      _selectedSubCategoryIds.add(id);
    }
    applyFilters();
  }

  void toggleDivision(int id) {
    if (_selectedDivisionIds.contains(id)) {
      _selectedDivisionIds.remove(id);
    } else {
      _selectedDivisionIds.add(id);
    }
    applyFilters();
  }

  void toggleSize(int id) {
    if (_selectedSizeIds.contains(id)) {
      _selectedSizeIds.remove(id);
    } else {
      _selectedSizeIds.add(id);
    }
    applyFilters();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    applyFilters();
  }

  void clearFilters() {
    _selectedSubCategoryIds.clear();
    _selectedDivisionIds.clear();
    _selectedSizeIds.clear();
    _selectedCategoryId = 0;
    _searchQuery = '';
    applyFilters();
  }

  Future<void> applyFilters() async {
    _isLoading = true;
    notifyListeners();

    final parms = ProductSearchParms(
      categories: _selectedCategoryId == 0 ? '' : _selectedCategoryId.toString(),
      subcategories: _selectedSubCategoryIds.join(','),
      divisions: _selectedDivisionIds.join(','),
      sizes: _selectedSizeIds.join(','),
      country: _selectedCountryId,
    );

    try {
      _products = await _productService.getProductsByFilters(parms);
      
      // Client-side search filtering if query exists
      if (_searchQuery.isNotEmpty) {
        _products = _products.where((p) => 
          p.p_name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.p_description.toLowerCase().contains(_searchQuery.toLowerCase())
        ).toList();
      }
    } catch (e) {
      debugPrint('Error filtering: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
