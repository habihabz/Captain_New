import { Component, ElementRef, OnInit } from '@angular/core';
import { CustomerOrder } from '../../../models/customer.order.model';
import { RequestParms } from '../../../models/requestParms';
import { ActivatedRoute, Router } from '@angular/router';
import { IProductService } from '../../../services/iproduct.service';
import { SnackBarService } from '../../../services/isnackbar.service';
import { IuserService } from '../../../services/iuser.service';
import { ICustomerOrder } from '../../../services/icustomer.order.service';
import { GeolocationService } from '../../../services/GeoCurrentLocation.service';
import { User } from '../../../models/user.model';
import { environment } from '../../../../environments/environment';
import { MasterData } from '../../../models/master.data.model';
import { OrderMovementHistory } from '../../../models/order.movement.history.model';
import { IOrderMovementHistoryService } from '../../../services/iorder.movement.history.service';

@Component({
  selector: 'app-order.details',
  templateUrl: './order.details.component.html',
  styleUrl: './order.details.component.css'
})
export class OrderDetailsComponent {
  apiUrl = `${environment.serverHostAddress}`;
  currentUser: User = new User();
  customerOrder: CustomerOrder = new CustomerOrder();
  orderId!: number;
  requestParms: RequestParms = new RequestParms();
  country: MasterData = new MasterData();
  orderMovementHistories: OrderMovementHistory[] = [];
  constructor(
    private router: Router,
    private elRef: ElementRef,
    private route: ActivatedRoute,
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
    this.country = this.geolocationService.getCurrentCountry();
    this.orderId = +this.route.snapshot.paramMap.get('id')!;
    this.getOrderDetails();

  }
  getOrderDetails(): void {
    this.getOrderMovementHistory(this.orderId);
    this.icustomerOrder.getCustomerOrder(this.orderId).subscribe(
      (data: CustomerOrder) => {
        this.customerOrder = data;
      },
      (error) => {
        this.snackBarService.showError('Error fetching order details.');
      }
    );
  }

  getAttachementOfaProduct(p_attachements: string) {
    var att: any;
    if (p_attachements) {
      att = JSON.parse(p_attachements);
    }
    return att;
  }
  downloadTaxInvoice() {
    this.icustomerOrder.downloadTaxInvoice(this.orderId).subscribe(
      (data: any) => {
        const blob = new Blob([data], { type: 'application/pdf' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Tax_Invoice_Order_${this.orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        this.snackBarService.showError('Error downloading tax invoice.');
      }
    );
  }
   getOrderMovementHistory(co_id: number) {
    this.iOrderMovementHistoryService.getOrderMovementHistoriesByOrder(co_id).subscribe(
      (data: OrderMovementHistory[]) => {
        this.orderMovementHistories = data;
      },
      (error: any) => {
      }
    );
  }
}
