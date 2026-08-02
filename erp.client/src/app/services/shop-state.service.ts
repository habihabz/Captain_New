import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ShopStateService {
  private hasState = false;
  private products: Product[] = [];
  private displayedProducts: Product[] = [];
  private currentPage: number = 1;
  private scrollY: number = 0;

  private selectedCategoryIds: number[] = [];
  private selectedSubCategoryIds: number[] = [];
  private selectedDivisionIds: number[] = [];
  private selectedSubDivisionIds: number[] = [];
  private selectedSizeIds: number[] = [];
  private sortBy: number = 0;

  constructor() { }

  saveState(
    products: Product[],
    displayedProducts: Product[],
    currentPage: number,
    scrollY: number,
    selectedCategoryIds: number[],
    selectedSubCategoryIds: number[],
    selectedDivisionIds: number[],
    selectedSubDivisionIds: number[],
    selectedSizeIds: number[],
    sortBy: number
  ) {
    this.hasState = true;
    this.products = products;
    this.displayedProducts = displayedProducts;
    this.currentPage = currentPage;
    this.scrollY = scrollY;
    
    this.selectedCategoryIds = selectedCategoryIds;
    this.selectedSubCategoryIds = selectedSubCategoryIds;
    this.selectedDivisionIds = selectedDivisionIds;
    this.selectedSubDivisionIds = selectedSubDivisionIds;
    this.selectedSizeIds = selectedSizeIds;
    this.sortBy = sortBy;
  }

  getState() {
    if (!this.hasState) {
      return null;
    }
    return {
      products: this.products,
      displayedProducts: this.displayedProducts,
      currentPage: this.currentPage,
      scrollY: this.scrollY,
      selectedCategoryIds: this.selectedCategoryIds,
      selectedSubCategoryIds: this.selectedSubCategoryIds,
      selectedDivisionIds: this.selectedDivisionIds,
      selectedSubDivisionIds: this.selectedSubDivisionIds,
      selectedSizeIds: this.selectedSizeIds,
      sortBy: this.sortBy
    };
  }

  clearState() {
    this.hasState = false;
    this.products = [];
    this.displayedProducts = [];
    this.currentPage = 1;
    this.scrollY = 0;
    
    this.selectedCategoryIds = [];
    this.selectedSubCategoryIds = [];
    this.selectedDivisionIds = [];
    this.selectedSubDivisionIds = [];
    this.selectedSizeIds = [];
    this.sortBy = 0;
  }
}
