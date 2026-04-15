import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ColDef, DomLayoutType, GridReadyEvent, RowSelectionOptions } from 'ag-grid-community';
import { User } from '../../models/user.model';
import { Subscription, forkJoin } from 'rxjs';
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
import { StatusService } from '../../services/status.service';
import { Status } from '../../models/status.model';
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
  customerOrderStatuses: Status[] = [];
  dbResult: DbResult = new DbResult();
  requestParms: RequestParms = new RequestParms();
  customerOrderStatus: Status = new Status();
  orderMovementHistories: OrderMovementHistory[] = [];
  bulkStatusId: number = 0;
  selectedRowsCount: number = 0;
  bulkUpdateStatuses: Status[] = [];
  isBulkListReady: boolean = true;
  rowSelectionOptions: RowSelectionOptions = {
    mode: 'multiRow',
    checkboxes: true,
    headerCheckbox: true,
    enableClickSelection: false,
  };
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
    private statusService: StatusService,
    private geolocationService: GeolocationService,
    private iOrderMovementHistoryService: IOrderMovementHistoryService

  ) {
    this.currentUser = iuser.getCurrentUser();
  }

  colDefs: ColDef[] = [

    {
      headerName: "Order ID",
      field: "co_id",
      width: 100,
      cellClass: 'text-center fw-bold text-muted',
      headerClass: 'text-center'
    },
    {
      headerName: 'Actions',
      width: 150,
      pinned: 'right',
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        actions: [
          {
            name: '',
            tooltip: 'View Order Details',
            cssClass: 'btn btn-outline-primary btn-xs rounded-pill',
            icon: 'fa fa-eye',
            action: 'onDetails',
            onDetails: (data: any) => this.onAction('details', data)
          }
        ]
      }
    },
    {
      headerName: "Customer",
      field: "co_customer_name",
      flex: 1.5,
      headerClass: 'text-start'
    },
    {
      headerName: "Phone",
      field: "co_customer_phone",
      width: 130,
      headerClass: 'text-start'
    },
    {
      headerName: "Product",
      field: "p_name",
      flex: 1.2,
      headerClass: 'text-start'
    },
    { headerName: "Size", field: "co_size_name", width: 80, headerClass: 'text-center', cellClass: 'text-center' },
    { headerName: "Color", field: "co_color_name", width: 90, headerClass: 'text-center', cellClass: 'text-center' },
    { headerName: "Qty", field: "co_qty", width: 70, headerClass: 'text-center', cellClass: 'text-center fw-bold' },
    {
      headerName: "Total Amount",
      field: "co_net_amount",
      width: 130,
      headerClass: 'text-end',
      cellClass: 'text-end fw-bold text-success',
      valueFormatter: p => "₹ " + Number(p.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
    },
    {
      headerName: "Status",
      field: "co_status_name",
      width: 140,
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: (p: any) => {
        if (!p.value) return '';
        const isCanceled = p.value.toLowerCase().includes('cancel');
        const isDelivered = p.value.toLowerCase().includes('deliver');
        const color = isCanceled ? '#dc3545' : (isDelivered ? '#198754' : '#6c757d');
        return `<span style="background-color: ${color}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">${p.value}</span>`;
      }
    },
    { headerName: "Email", field: "co_customer_email", width: 180, headerClass: 'text-start' },
    { headerName: "Address", field: "co_c_address_details", width: 250, headerClass: 'text-start' }
  ];



  ngOnInit(): void {
    this.getStatuses();
    this.getCustomerOrders();
    this.subscription.add(
      this.icustomerOrder.refresh$.subscribe(() => {
        this.getCustomerOrders();
      })
    );

  }

  getStatuses() {
    this.statusService.getStatuses(1).subscribe(
      (data: Status[]) => {
        this.customerOrderStatuses = data.filter(x => x.s_workflow_id === 1);
        this.updateBulkStatusList();
      },
      (error: any) => {

      }
    );
  }

  updateBulkStatusList() {
    this.isBulkListReady = false;
    this.bulkUpdateStatuses = this.customerOrderStatuses.filter(x => Number(x.s_id) !== Number(this.requestParms.id));
    setTimeout(() => {
      this.isBulkListReady = true;
    }, 50);
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
        // Resolve High-Resolution Variant Image
        this.resolveOrderItemImage(this.customerOrder);
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

  onSelectionChanged() {
    this.selectedRowsCount = this.customerOrderGrid.api.getSelectedRows().length;
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
  onCustomerOrderStatusChange(s_id: number) {
    this.requestParms.id = s_id;
    this.updateBulkStatusList();
    this.getCustomerOrders();
  }

  setTab(tab: string) {
    this.requestParms.completedYn = tab;
    // reset date filters if switching to Active Orders to fetch correctly
    if (tab === 'N') {
      this.requestParms.startDate = '';
      this.requestParms.endDate = '';
    }
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

  onBulkUpdate() {
    const selectedRows = this.customerOrderGrid.api.getSelectedRows();
    if (selectedRows.length === 0) {
      this.snackBarService.showError("Please select at least one order.");
      return;
    }

    if (this.bulkStatusId === 0) {
      this.snackBarService.showError("Please select a new status for bulk update.");
      return;
    }

    if (!confirm(`Are you sure you want to update ${selectedRows.length} orders to ${this.customerOrderStatuses.find(x => x.s_id == this.bulkStatusId)?.s_name}?`)) {
      return;
    }

    const updates = selectedRows.map(order => {
      const params = new RequestParms();
      params.id = order.co_id;
      params.status = this.bulkStatusId;
      params.user = this.currentUser.u_id;
      return this.icustomerOrder.updateStatusForCustomerOrder(params);
    });

    forkJoin(updates).subscribe({
      next: (results) => {
        const successes = results.filter(r => r.message === "Success").length;
        this.snackBarService.showSuccess(`Batch process completed: ${successes} orders updated successfully.`);
        this.getCustomerOrders();
        this.bulkStatusId = 0;
      },
      error: (err) => {
        this.snackBarService.showError("Batch update failed. Please try again.");
      }
    });
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

  // IMAGE RESOLUTION LOGIC
  formatImageUrl(url: string | undefined): string {
    if (!url) return 'assets/placeholder-product.png';
    if (url.startsWith('http')) {
      return url.replace(/([^:]\/)\/+/g, "$1");
    }
    const cleanUrl = url.replace(/^\/+/, '');
    return `${this.apiUrl}/${cleanUrl}`.replace(/([^:]\/)\/+/g, "$1");
  }

  resolveOrderItemImage(order: CustomerOrder) {
    if (!order.co_product) return;

    this.iproductService.getProductAttachementsByColor({
      id: order.co_product,
      color: order.co_color || 0
    } as RequestParms).subscribe({
      next: (attachments: any[]) => {
        if (attachments && attachments.length > 0) {
          // Priority 1: Exact ID Match
          let match = attachments.find(a => Number(a.pa_color) === Number(order.co_color));

          // Priority 2: Case-insensitive Name Match (Fallback)
          if (!match && order.co_color_name) {
            match = attachments.find(a =>
              a.pa_color_name?.toLowerCase() === order.co_color_name?.toLowerCase()
            );
          }

          if (match) {
            order.resolvedImageUrl = this.formatImageUrl(match.pa_path);
          } else {
            order.resolvedImageUrl = this.formatImageUrl(attachments[0].pa_path);
          }
        }
      },
      error: () => {
        // Fallback to basic attachments if specific call fails
        const basic = this.getAttachementOfaProduct(order.p_attachements || '');
        if (basic && basic.length > 0) {
          order.resolvedImageUrl = this.formatImageUrl(basic[0].pa_path);
        }
      }
    });
  }

  getOrderItemImage(order: CustomerOrder): string {
    if (order.resolvedImageUrl) return order.resolvedImageUrl;
    const att = this.getAttachementOfaProduct(order.p_attachements || '');
    if (att && att.length > 0) {
      return this.formatImageUrl(att[0].pa_path);
    }
    return 'assets/placeholder-product.png';
  }

  isOrderCanceled(): boolean {
    return !!(this.customerOrder && (this.customerOrder.co_is_canceled === 'Y' || this.customerOrder.co_status_name === 'Canceled'));
  }

  closeModal(event: any, modalId: string) {
    if (event && event.target) {
        event.target.blur(); // Remove focus
    }
    $('#' + modalId).modal('hide');
  }
}
