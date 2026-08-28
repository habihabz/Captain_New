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
import { IConstantValueService } from '../../../../services/iconstant.values.service';

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
  
  companyAddress: string = 'Husi International, Kallachal, Pulpatta, Malappuram, Kerala 676121';
  companyEmail: string = 'info@captain.net.in';
  companyPhone: string = '+91 7558030666';
  
  constructor(
    private elRef: ElementRef,
    private router: Router,
    private imasterDataService: IMasterDataService,
    private icategoryService: ICategoryService,
    private iconstantValueService: IConstantValueService
  ) {
    
  }
  ngOnInit(): void {

    this.loadCategories();
    this.getMasterDatasByType("SubCategory", (data) => { this.subcategories = data; });
    this.loadContactInfo();
  }

  loadContactInfo(): void {
    this.iconstantValueService.getConstantValues().subscribe({
      next: (constants) => {
        const address = constants.find(c => c.cv_name === 'Company Address');
        if (address && address.cv_value) this.companyAddress = address.cv_value;

        const email = constants.find(c => c.cv_name === 'Support Email');
        if (email && email.cv_value) this.companyEmail = email.cv_value;

        const phone = constants.find(c => c.cv_name === 'Company Phone');
        if (phone && phone.cv_value) this.companyPhone = phone.cv_value;
      },
      error: (err) => console.error('Error loading contact info:', err)
    });
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