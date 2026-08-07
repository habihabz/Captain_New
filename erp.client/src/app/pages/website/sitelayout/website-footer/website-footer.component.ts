import { Component, ElementRef, OnInit } from '@angular/core';
import { Category } from "../../../../models/category.model";
import { Product } from "../../../../models/product.model";
import { MasterData } from '../../../../models/master.data.model';
import { RequestParms } from '../../../../models/requestParms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { IProductService } from '../../../../services/iproduct.service';
import { IMasterDataService } from '../../../../services/imaster.data.service';
import { ICategoryService } from '../../../../services/icategory.service';

@Component({
  selector: 'app-website-footer',
  templateUrl: './website-footer.component.html',
  styleUrl: './website-footer.component.css'
})
export class WebsiteFooterComponent implements OnInit{
  product:Product=new Product();
  products:Product []=[];
  categories: Category[] = [];
  subcategories: MasterData[] = [];
  requestParms: RequestParms = new RequestParms();
  subscription: Subscription = new Subscription();
  showContact: boolean = false;
  currentYear: number = new Date().getFullYear();
  
  constructor(
    private elRef: ElementRef,
    private router: Router,
    private imasterDataService: IMasterDataService,
    private icategoryService: ICategoryService,
  ) {
    
  }
  ngOnInit(): void {

    this.loadCategories();
    this.getMasterDatasByType("SubCategory", (data) => { this.subcategories = data; });
 
  }
  loadCategories(): void {
    this.icategoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
      },
      (error: any) => {
       
      }
    );
  }
  getMasterDatasByType(masterType: string, callback: (data: MasterData[]) => void): void {
    this.requestParms = new RequestParms();
    this.requestParms.type = masterType;
    this.imasterDataService.getMasterDatasByType(this.requestParms).subscribe(
      (data: MasterData[]) => {
        callback(data);  // Pass the data to the callback function
      },
      (error: any) => {
       
        callback([]);  // Pass an empty array if there's an error
      }
    );
  }

  toggleContactInfo() {
    this.showContact = !this.showContact;
    if (this.showContact) {
      setTimeout(() => {
        const contactDiv = document.getElementById('contactDetailsContent');
        if (contactDiv) {
          contactDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }, 150);
    }
  }
}