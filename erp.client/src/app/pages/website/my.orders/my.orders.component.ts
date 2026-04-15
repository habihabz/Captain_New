import { Component, ElementRef, OnInit } from '@angular/core';
import { CustomerOrder } from '../../../models/customer.order.model';
import { RequestParms } from '../../../models/requestParms';
import { Router } from '@angular/router';
import { IProductService } from '../../../services/iproduct.service';
import { SnackBarService } from '../../../services/isnackbar.service';
import { IuserService } from '../../../services/iuser.service';
import { ICustomerOrder } from '../../../services/icustomer.order.service';
import { GeolocationService } from '../../../services/GeoCurrentLocation.service';
import { User } from '../../../models/user.model';
import { environment } from '../../../../environments/environment';
import { IOrderMovementHistoryService } from '../../../services/iorder.movement.history.service';
import { OrderMovementHistory } from '../../../models/order.movement.history.model';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my.orders.component.html',
  styleUrls: ['./my.orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  apiUrl = `${environment.serverHostAddress}`;
  currentUser: User = new User();
  myorders: CustomerOrder[] = [];
  filteredOrders: CustomerOrder[] = [];
  pagedOrders: CustomerOrder[] = [];

  requestParms: RequestParms = new RequestParms();

  // Filter properties
  searchTerm: string = '';
  selectedStatuses: Set<string> = new Set();
  selectedYears: Set<string> = new Set();
  
  availableStatuses = ['Confirmed', 'Shipped', 'Delivered', 'Canceled', 'Returned'];
  availableYears = ['2026', '2025', '2024', 'Older'];

  // Pagination controls
  currentPage: number = 1;
  ordersPerPage: number = 5;
  totalPages: number = 0;

  constructor(
    private router: Router,
    private elRef: ElementRef,
    private iproductService: IProductService,
    private snackBarService: SnackBarService,
    private iuser: IuserService,
    private icustomerOrder: ICustomerOrder,
    private geolocationService: GeolocationService,
    private iOrderMovementHistoryService: IOrderMovementHistoryService
  ) {
    this.currentUser = this.iuser.getCurrentUser();
  }

  ngOnInit(): void {
    this.getMyOrders();
  }

  getMyOrders(): void {
    this.requestParms.user = this.currentUser.u_id;
    this.icustomerOrder.getMyOrders(this.requestParms).subscribe(
      (data: CustomerOrder[]) => {
        this.myorders = data;
        this.applyFilters();
        
        // Fetch specific images for each order item
        this.myorders.forEach(order => {
          this.resolveOrderItemImage(order);
          
          // Prioritize actual cancellation status over stale primary status
          if (order.co_is_canceled === 'Y') {
            order.co_status_name = 'Canceled';
          }

          // If status name is missing, try to fetch the latest from movement history
          if (!order.co_status_name) {
            this.fetchLatestStatusFromHistory(order);
          }
        });

      },
      (error: any) => {
        this.snackBarService.showError('Error fetching orders.');
      }
    );
  }

  toggleStatus(status: string) {
    if (this.selectedStatuses.has(status)) {
        this.selectedStatuses.delete(status);
    } else {
        this.selectedStatuses.add(status);
    }
    this.applyFilters();
  }

  toggleYear(year: string) {
    if (this.selectedYears.has(year)) {
        this.selectedYears.delete(year);
    } else {
        this.selectedYears.add(year);
    }
    this.applyFilters();
  }

  applyFilters() {
    this.filteredOrders = this.myorders.filter(order => {
        const matchesSearch = !this.searchTerm || 
            order.p_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            order.co_id.toString().includes(this.searchTerm);
            
        const matchesStatus = this.selectedStatuses.size === 0 || 
            this.selectedStatuses.has(order.co_status_name);
            
        const orderYear = new Date(order.co_cre_date).getFullYear().toString();
        let yearCategory = orderYear;
        if (parseInt(orderYear) < 2024) yearCategory = 'Older';
        
        const matchesYear = this.selectedYears.size === 0 || 
            this.selectedYears.has(yearCategory);
            
        return matchesSearch && matchesStatus && matchesYear;
    });
    
    this.currentPage = 1;
    this.setupPagination();
  }

  resolveOrderItemImage(order: any) {
    this.iproductService.getProductAttachementsByColor({
      id: order.co_product,
      color: order.co_color
    } as RequestParms).subscribe((attachments: any[]) => {
      if (attachments && attachments.length > 0) {
        const image =
          attachments.find(x => String(x.pa_color).trim() === String(order.co_color).trim())?.pa_image_path ||
          attachments[0]?.pa_image_path || '';
        
        order.resolvedImageUrl = this.formatImageUrl(image);
      } else {
        order.resolvedImageUrl = this.getOrderItemImage(order);
      }
    });
  }

  getOrderItemImage(order: CustomerOrder): string {
    const attachments = this.getAttachementOfaProduct(order.p_attachements);
    if (!attachments || attachments.length === 0) return '';

    const cartColor = String(order.co_color || '').trim();
    const cartColorName = String(order.co_color_name || '').toLowerCase().trim();
    
    let matchingImage = attachments.find((x: any) => String(x.pa_color || '').trim() === cartColor);
    
    if (!matchingImage && cartColorName) {
        matchingImage = attachments.find((x: any) => String(x.pa_color_name || x.pa_color || '').toLowerCase().trim() === cartColorName);
    }
    
    return this.formatImageUrl(matchingImage ? matchingImage.pa_image_path : attachments[0].pa_image_path);
  }

  private formatImageUrl(path: string): string {
    if (!path) return '';
    let cleanPath = path.trim();
    while (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.substring(1);
    }
    if (cleanPath.startsWith('http')) return cleanPath;
    return `${this.apiUrl}/${cleanPath}`;
  }

  setupPagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.ordersPerPage);
    this.updatePagedOrders();
  }

  getAttachementOfaProduct(p_attachements: string) {
    var att: any;
    if (p_attachements) {
      att = JSON.parse(p_attachements);
    }
    return att;
  }
  updatePagedOrders(): void {
    const start = (this.currentPage - 1) * this.ordersPerPage;
    const end = start + this.ordersPerPage;
    this.pagedOrders = this.filteredOrders.slice(start, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedOrders();
  }
  fetchLatestStatusFromHistory(order: any) {
    this.iOrderMovementHistoryService.getOrderMovementHistoriesByOrder(order.co_id).subscribe(
      (history: OrderMovementHistory[]) => {
        if (history && history.length > 0) {
          // The last entry in history is the latest status
          order.co_status_name = history[history.length - 1].omh_status_name;
        } else {
          order.co_status_name = 'Return Initiated';
        }
      }
    );
  }

  orderDetails(orderId: number): void {
    this.router.navigate(['/order-details', orderId]);
  }
}
