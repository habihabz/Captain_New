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

@Component({
  selector: 'app-my-orders',
  templateUrl: './my.orders.component.html',
  styleUrls: ['./my.orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  apiUrl = `${environment.serverHostAddress}`;
  currentUser: User = new User();
  myorders: CustomerOrder[] = [];
  pagedOrders: CustomerOrder[] = [];

  requestParms: RequestParms = new RequestParms();

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
    private geolocationService: GeolocationService
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
        this.setupPagination();
      },
      (error: any) => {
        this.snackBarService.showError('Error fetching orders.');
      }
    );
  }

  setupPagination(): void {
    this.totalPages = Math.ceil(this.myorders.length / this.ordersPerPage);
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
    this.pagedOrders = this.myorders.slice(start, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagedOrders();
  }
  orderDetails(orderId: number): void {
    
    this.router.navigate(['/order-details', orderId]);
  }
}
