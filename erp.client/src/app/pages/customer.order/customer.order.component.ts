import { Component, ElementRef, ViewChild } from '@angular/core';
import { ColDef, DomLayoutType, GridReadyEvent } from 'ag-grid-community';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';
import { DbResult } from '../../models/dbresult.model';
import { CustomerOrder } from '../../models/customer.order.model';
import { Router } from '@angular/router';
import { IProductService } from '../../services/iproduct.service';
import { SnackBarService } from '../../services/isnackbar.service';
import { ICartService } from '../../services/icart.service';
import { IuserService } from '../../services/iuser.service';
import { GeolocationService } from '../../services/GeoCurrentLocation.service';
import { Customer } from '../../models/customer.model';
import { ICustomerOrder } from '../../services/icustomer.order.service';
import { RequestParms } from '../../models/requestParms';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { GridService } from '../../services/igrid.service';
import { AgGridAngular } from 'ag-grid-angular';
import { CustomerOrderDetail } from '../../models/customer.order.detail.model';
import { ICustomerOrderStatusService } from '../../services/icustomer.order.status.service';
import { CustomerOrderStatus } from '../../models/customer.order.status.model';
import { environment } from '../../../environments/environment';
import { IOrderMovementHistoryService } from '../../services/iorder.movement.history.service';
import { OrderMovementHistory } from '../../models/order.movement.history.model';
declare var $: any;

@Component({
  selector: 'app-customer.order',
  templateUrl: './customer.order.component.html',
  styleUrl: './customer.order.component.css'
})
export class CustomerOrderComponent {
  apiUrl = `${environment.serverHostAddress}`;
  pagination = true;
  paginationPageSize5 = 5;
  paginationPageSizeSelector5 = [5, 10, 20, 50, 100];
  paginationPageSize10 = 10;
  paginationPageSizeSelector10 = [10, 20, 50, 100];
  domLayout: DomLayoutType = 'autoHeight';
  currentUser: User = new User();
  subscription: Subscription = new Subscription();
  customerOrder: CustomerOrder = new CustomerOrder();
  customerOrders: CustomerOrder[] = [];
  customerOrderStatuses: CustomerOrderStatus[] = [];
  dbResult: DbResult = new DbResult();
  requestParms: RequestParms = new RequestParms();
  customerOrderStatus: CustomerOrderStatus = new CustomerOrderStatus();
  orderMovementHistories: OrderMovementHistory[] = [];
  @ViewChild('customerOrderGrid') customerOrderGrid!: AgGridAngular;


  constructor(

    private router: Router,
    private elRef: ElementRef,
    private iproductService: IProductService,
    private igridService: GridService,
    private snackBarService: SnackBarService,
    private icartService: ICartService,
    private iuser: IuserService,
    private icustomerOrder: ICustomerOrder,
    private icustomerOrderStatus: ICustomerOrderStatusService,
    private geolocationService: GeolocationService,
    private iOrderMovementHistoryService: IOrderMovementHistoryService

  ) {
    this.currentUser = iuser.getCurrentUser();
  }

  colDefs: ColDef[] = [
    { headerName: "Id", field: "co_id", width: 90 },
    {
      headerName: 'Details ',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        name: 'Details',
        cssClass: 'btn btn-outline-default',
        icon: 'fa fa-eye',
        action: 'onDetails',
        onDetails: (data: any) => this.onAction('details', data)
      }
    },
    {
      headerName: 'Change Status',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        name: 'Change Status',
        cssClass: 'btn btn-outline-warning',
        icon: 'fa fa-exchange',
        action: 'onStatusChange',
        onStatusChange: (data: any) => this.onAction('statusChange', data)
      }
    },
    { headerName: "Customer", field: "co_customer_name" },
    { headerName: "Phone", field: "co_customer_phone" },
    
    { headerName: "Product", field: "p_name" },

    { headerName: "Qty", field: "co_qty", width: 90 },

    {
      headerName: "Unit Price",
      field: "co_unit_price",
      valueFormatter: p => "₹ " + Number(p.value || 0).toFixed(2)
    },
    {
      headerName: "Total Amount",
      field: "co_amount",
      valueFormatter: p => "₹ " + Number(p.value || 0).toFixed(2)
    },
    {
      headerName: "Discount",
      field: "co_discount_amount",
      valueFormatter: p => "₹ " + Number(p.value || 0).toFixed(2)
    },

    {
      headerName: "GST",
      field: "co_gst_amount",
      valueFormatter: p => "₹ " + Number(p.value || 0).toFixed(2)
    },

    {
      headerName: "Delivery",
      field: "co_delivery_charge",
      valueFormatter: p => "₹ " + Number(p.value || 0).toFixed(2)
    },

    {
      headerName: "Total",
      field: "co_net_amount",
      valueFormatter: p => "₹ " + Number(p.value || 0).toFixed(2)
    },

    { headerName: "Status", field: "co_status_name" },
    { headerName: "Email", field: "co_customer_email" },

    { headerName: "Address", field: "co_c_address_details" }


  ];



  ngOnInit(): void {

    this.getCustomerOrderStatuses();
    this.getCustomerOrders();
    this.subscription.add(
      this.icustomerOrder.refresh$.subscribe(() => {
        this.getCustomerOrders();
      })
    );

  }

  getCustomerOrderStatuses() {
    this.icustomerOrderStatus.getCustomerOrderStatuses().subscribe(
      (data: CustomerOrderStatus[]) => {
        this.customerOrderStatuses = data;
      },
      (error: any) => {

      }
    );
  }

  frameworkComponents = {
    actionRenderer: ActionRendererComponent
  };

  defaultColDef = {
    sortable: true,
    filter: true
  };

  onAction(action: string, data: any) {
    switch (action) {
      case 'details':
        this.onDetails(data);
        break;
      case 'statusChange':
        this.onStatusChange(data);
        break;
      default:
        this.snackBarService.showError("Unknown Action " + action);;
    }
  }

  onDetails(data: any) {
    this.getOrderMovementHistory(data.co_id);
    this.icustomerOrder.getCustomerOrder(data.co_id).subscribe(
      (data: CustomerOrder) => {
        this.customerOrder = data;
        $("#customerOrderDetailModal").modal("show");
      },
      (error: any) => {

      }
    );
  }

  onStatusChange(data: any) {
    this.customerOrder = data;
    $("#StatusChangeModal").modal("show");
  }

  onGridReady(event: GridReadyEvent) {
    setTimeout(() => {
      this.customerOrderGrid.api.sizeColumnsToFit();
    }, 0);
  }

  getCustomerOrders() {
    this.requestParms.user = this.currentUser.u_id;
    this.icustomerOrder.getCustomerOrders(this.requestParms).subscribe(
      (data: CustomerOrder[]) => {
        this.customerOrders = data;
        setTimeout(() => {
          this.customerOrderGrid.api.autoSizeAllColumns();
        }, 500);
      },
      (error: any) => {

      }
    );

  }
  onCustomerOrderStatusChange(cos_id: number) {
    this.requestParms.id = cos_id;
    this.getCustomerOrders();
  }
  onNewStatusChange(s_id: number) {
    this.requestParms.status = s_id;
  }
  updateStatusForCustomerOrder() {
    this.requestParms.user = this.currentUser.u_id;
    this.requestParms.id = this.customerOrder.co_id;
    this.icustomerOrder.updateStatusForCustomerOrder(this.requestParms).subscribe(
      (data: DbResult) => {
        if (data.message == "Success") {
          this.getCustomerOrders();
          this.customerOrder = new CustomerOrder();
          this.requestParms = new RequestParms();
          $("#StatusChangeModal").modal("hide");
        } else {
          this.snackBarService.showError(data.message);;
        }

      },
      (error: any) => {

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

  getOrderMovementHistory(co_id: number) {
    this.iOrderMovementHistoryService.getOrderMovementHistoriesByOrder(co_id).subscribe(
      (data: OrderMovementHistory[]) => {
        this.orderMovementHistories = data;
      },
      (error: any) => {
      }
    );
  }

  downloadTaxInvoice(orderId: number) {

    this.icustomerOrder.invoice(orderId)
      .subscribe({

        next: (data: Blob) => {

          const blob = new Blob([data], { type: 'application/pdf' });

          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `Tax_Invoice_Order_${orderId}.pdf`;

          document.body.appendChild(a);
          a.click();

          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },

        error: () => {
          this.snackBarService.showError('Error downloading tax invoice.');
        }

      });
  }
}
