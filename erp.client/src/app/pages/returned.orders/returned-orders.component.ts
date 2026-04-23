import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColDef, DomLayoutType, GridApi, GridReadyEvent, RowSelectionOptions } from 'ag-grid-community';
import { User } from '../../models/user.model';
import { Subscription, forkJoin } from 'rxjs';
import { DbResult } from '../../models/dbresult.model';
import { Router } from '@angular/router';
import { SnackBarService } from '../../services/isnackbar.service';
import { IuserService } from '../../services/iuser.service';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { AgGridAngular } from 'ag-grid-angular';
import { IReturnOrderService, ReturnOrder } from '../../services/ireturn.order.service';
import { StatusService } from '../../services/status.service';
import { Status } from '../../models/status.model';
import { RequestParms } from '../../models/requestParms';
import { IOrderMovementHistoryService } from '../../services/iorder.movement.history.service';
import { IProductService } from '../../services/iproduct.service';
import { OrderMovementHistory } from '../../models/order.movement.history.model';
import { IPaymentService, RefundRequest } from '../../services/ipayment.service';
import { ICustomerOrder } from '../../services/icustomer.order.service';
import { IAddressService } from '../../services/iaddress.service';
import { Address } from '../../models/address.model';
declare var $: any;

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-returned-orders',
  templateUrl: './returned-orders.component.html',
  styleUrls: ['./returned-orders.component.css']
})
export class ReturnedOrdersComponent implements OnInit {
  environment = environment;
  private gridApi!: GridApi;
  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';
  currentUser: User = new User();
  returnOrders: ReturnOrder[] = [];
  activeDetailTab: string = 'summary';
  selectedReturn: ReturnOrder = {} as ReturnOrder;
  selectedOrder: any = null;
  statuses: Status[] = [];
  requestParms: RequestParms = new RequestParms();
  orderMovementHistories: OrderMovementHistory[] = [];
  selectedRowsCount: number = 0;
  bulkStatusId: number = 0;
  bulkUpdateStatuses: Status[] = [];
  isBulkListReady: boolean = true;
  rowSelectionOptions: RowSelectionOptions = {
    mode: 'multiRow',
    checkboxes: true,
    headerCheckbox: true,
    enableClickSelection: false,
  };

  @ViewChild('returnOrderGrid') returnOrderGrid!: AgGridAngular;

  constructor(
    private router: Router,
    private iuser: IuserService,
    private ireturnOrder: IReturnOrderService,
    private statusService: StatusService,
    private snackBarService: SnackBarService,
    private iOrderMovementHistoryService: IOrderMovementHistoryService,
    private paymentService: IPaymentService,
    private icustomerOrder: ICustomerOrder,
    private iProductService: IProductService,
    private iAddressService: IAddressService
  ) {
    this.currentUser = iuser.getCurrentUser();
  }

  colDefs: ColDef[] = [

    {
      headerName: "Return ID",
      field: "ro_id",
      width: 100,
      cellClass: 'text-center fw-bold text-muted',
      headerClass: 'text-center'
    },
     {
      headerName: "Order ID",
      field: "ro_order_no",
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
            tooltip: 'View Details',
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
      field: "ro_customer_name",
      flex: 1.2,
      headerClass: 'text-start'
    },
    {
      headerName: "Product",
      field: "ro_prod_name",
      flex: 1.5,
      headerClass: 'text-start'
    },
    {
      headerName: "Amount",
      field: "ro_net_amount",
      width: 120,
      headerClass: 'text-end',
      cellClass: 'text-end fw-bold text-success',
      valueFormatter: p => "₹ " + Number(p.value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
    },
    { headerName: "Return Reason", field: "ro_reason", width: 180, headerClass: 'text-start' },
    {
      headerName: "Status",
      field: "ro_status_name",
      width: 140,
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: (p: any) => {
        const val = p.data.ro_status_name || p.data.co_status_name;
        if (!val) return '';
        const isApproved = val.toLowerCase().includes('approve') || val.toLowerCase().includes('verif');
        const isRejected = val.toLowerCase().includes('reject');
        const color = isApproved ? '#198754' : (isRejected ? '#dc3545' : '#6c757d');
        return `<span style="background-color: ${color}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">${val}</span>`;
      }
    },
    {
      headerName: "Created On",
      field: "ro_cre_date",
      width: 130,
      headerClass: 'text-center',
      cellClass: 'text-center',
      valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString('en-GB') : ''
    }
  ];

  frameworkComponents = {
    actionRenderer: ActionRendererComponent
  };

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  ngOnInit(): void {
    this.getReturnRequests();
    this.getStatuses();
  }

  getReturnRequests() {
    this.requestParms.user = this.currentUser.u_id;
    this.ireturnOrder.getReturnRequests(this.requestParms).subscribe(
      (data: ReturnOrder[]) => {
        this.returnOrders = data;
        setTimeout(() => this.returnOrderGrid.api.sizeColumnsToFit(), 500);
      }
    );
  }

  updateBulkStatusList() {
    this.isBulkListReady = false;
    this.bulkUpdateStatuses = this.statuses.filter(x => Number(x.s_id) !== Number(this.requestParms.status));
    setTimeout(() => {
      this.isBulkListReady = true;
    }, 50);
  }

  setTab(tab: string) {
    this.requestParms.completedYn = tab;
    // reset date filters if switching to Active Returns
    if (tab === 'N') {
      this.requestParms.startDate = '';
      this.requestParms.endDate = '';
    }
    this.getReturnRequests();
  }

  onStatusFilterChange(event: any) {
    this.requestParms.status = +event;
    this.updateBulkStatusList();
    this.getReturnRequests();
  }

  getStatuses() {
    this.statusService.getStatuses(2).subscribe(
      (data: Status[]) => {
        this.statuses = data.filter(x => x.s_workflow_id === 2);
        this.updateBulkStatusList();
      }
    );
  }

  setDetailTab(tab: string) {
    this.activeDetailTab = tab;
  }

  onAction(action: string, data: any) {
    this.selectedReturn = data;
    if (action === 'details') {
      this.activeDetailTab = 'summary'; // Reset to summary when opening
      this.getOrderMovementHistory(data.ro_order_no);
      this.icustomerOrder.getCustomerOrder(data.ro_order_no).subscribe(order => {
        this.selectedOrder = order;
        this.resolveOrderItemImage(this.selectedOrder);
        
        // If address details is just an ID or empty, fetch from master
        if (order.co_c_address && (!order.co_c_address_details || !isNaN(Number(order.co_c_address_details)))) {
          this.iAddressService.getAddress(order.co_c_address).subscribe((addresses: Address[]) => {
            if (addresses && addresses.length > 0) {
              this.selectedOrder.co_c_address_details = addresses[0].ad_address + ', ' + (addresses[0].ad_pincode || '');
            }
          });
        }
      });
      $("#returnDetailModal").modal("show");
    } else if (action === 'statusChange') {
      $("#ReturnStatusModal").modal("show");
    } else if (action === 'raiseRefund') {
      if (confirm('Move this order to "Payment Initiated" for the accounts team?')) {
        this.updateReturnStatus(14); // 14: Payment Initiated
      }
    }
  }

  getOrderMovementHistory(orderId: number) {
    this.iOrderMovementHistoryService.getOrderMovementHistoriesByReturn(orderId).subscribe(
      (data: OrderMovementHistory[]) => {
        this.orderMovementHistories = data;
      },
      (error: any) => {
      }
    );
  }

  issueRefund(order: ReturnOrder) {
    this.selectedReturn = order;

    // Fetch the customer order to get the payment reference explicitly
    this.icustomerOrder.getCustomerOrder(order.ro_order_no).subscribe({
      next: (orderData: any) => {
        const paymentId = orderData?.co_payment_id;

        if (!paymentId) {
          this.snackBarService.showError("No payment reference found for this order. Cannot process automatic refund.");
          return;
        }

        if (!confirm(`Are you sure you want to issue a refund of ₹${order.ro_net_amount} for this order via Razorpay?`)) {
          return;
        }

        const refundRequest: RefundRequest = {
          paymentId: paymentId,
          amount: order.ro_net_amount || 0,
          orderId: order.ro_order_no
        };

        this.paymentService.processRefund(refundRequest).subscribe({
          next: (res) => {
            if (res.status === 'success') {
              this.snackBarService.showSuccess("Refund processed successfully!");
              // Update status to Refund Completed (ID 15)
              this.updateReturnStatus(15);
              $("#returnDetailModal").modal("hide");
            } else {
              this.snackBarService.showError(res.message || "Failed to process refund.");
            }
          },
          error: (err) => {
            const errorMsg = err.error?.message || err.error || err.message;
            this.snackBarService.showError("An error occurred while processing the refund: " + errorMsg);
          }
        });
      },
      error: (err) => {
        this.snackBarService.showError("Failed to fetch order details to process refund.");
      }
    });
  }

  updateReturnStatus(newStatus: number) {
    const updatePayload: ReturnOrder = {
      ...this.selectedReturn,
      ro_status: newStatus,
      ro_cre_by: this.currentUser.u_id
    };

    this.ireturnOrder.updateReturnStatus(updatePayload).subscribe(
      (data: DbResult) => {
        if (data.message === "Success") {
          this.snackBarService.showSuccess("Return status updated successfully.");
          this.getReturnRequests();
          $("#ReturnStatusModal").modal("hide");
        } else {
          this.snackBarService.showError(data.message);
        }
      }
    );
  }

  onGridReady(event: GridReadyEvent) {
    event.api.sizeColumnsToFit();
  }

  onSelectionChanged() {
    this.selectedRowsCount = this.returnOrderGrid.api.getSelectedRows().length;
  }

  onBulkUpdate() {
    const selectedRows = this.returnOrderGrid.api.getSelectedRows();
    if (selectedRows.length === 0) {
      this.snackBarService.showError("Please select at least one return request.");
      return;
    }

    if (this.bulkStatusId === 0) {
      this.snackBarService.showError("Please select a new status for bulk update.");
      return;
    }

    if (!confirm(`Are you sure you want to update ${selectedRows.length} returns to ${this.statuses.find(x => x.s_id == this.bulkStatusId)?.s_name}?`)) {
      return;
    }

    const updates = selectedRows.map(row => {
      const updatePayload: ReturnOrder = {
        ...row,
        ro_status: this.bulkStatusId,
        ro_cre_by: this.currentUser.u_id
      };
      return this.ireturnOrder.updateReturnStatus(updatePayload);
    });

    forkJoin(updates).subscribe({
      next: (results) => {
        const successes = results.filter(r => r.message === "Success").length;
        this.snackBarService.showSuccess(`Batch process completed: ${successes} returns updated successfully.`);
        this.getReturnRequests();
        this.bulkStatusId = 0;
      },
      error: (err) => {
        this.snackBarService.showError("Batch update failed. Please try again.");
      }
    });
  }

  closeModal(event: any, modalId: string) {
    if (event && event.target) {
      event.target.blur(); // Remove focus to fix aria-hidden descendant focus warning
    }
    $('#' + modalId).modal('hide');
  }

  getAttachementOfaProduct(p_attachements: string) {
    if (p_attachements) {
      try {
        return JSON.parse(p_attachements);
      } catch (e) {
        return [];
      }
    }
    return [];
  }

  resolveOrderItemImage(order: any) {
    this.iProductService.getProductAttachementsByColor({
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

  getOrderItemImage(order: any): string {
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
    while (cleanPath.startsWith('/')) { cleanPath = cleanPath.substring(1); }
    if (cleanPath.startsWith('http')) return cleanPath;
    return `${this.environment.serverHostAddress}/${cleanPath}`;
  }
}
