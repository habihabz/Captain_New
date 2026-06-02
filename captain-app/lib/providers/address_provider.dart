import 'package:flutter/material.dart';
import '../models/address.dart';
import '../services/address_service.dart';

class AddressProvider with ChangeNotifier {
  final AddressService _addressService = AddressService();
  List<Address> _addresses = [];
  Address? _selectedAddress;
  bool _isLoading = false;

  List<Address> get addresses => _addresses;
  Address? get selectedAddress => _selectedAddress;
  bool get isLoading => _isLoading;

  Future<void> fetchAddresses(int customerId) async {
    _isLoading = true;
    notifyListeners();

    _addresses = await _addressService.getMyAddresses(customerId);
    
    // Auto-select default address or first one
    if (_addresses.isNotEmpty) {
      _selectedAddress = _addresses.firstWhere(
        (a) => a.ad_is_default_yn == 'Y', 
        orElse: () => _addresses.first
      );
    }
    
    _isLoading = false;
    notifyListeners();
  }

  void selectAddress(Address address) {
    _selectedAddress = address;
    notifyListeners();
  }

  Future<bool> addAddress(Address address, int customerId) async {
    _isLoading = true;
    notifyListeners();
    try {
      final result = await _addressService.createOrUpdateAddress(address);
      if (result.status) {
        await fetchAddresses(customerId);
        return true;
      }
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
