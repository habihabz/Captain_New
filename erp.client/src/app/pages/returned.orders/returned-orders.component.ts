import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColDef, DomLayoutType, GridReadyEvent } from 'ag-grid-community';
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
import { OrderMovementHistory } from '../../models/order.movement.history.model';
declare var $: any;

@Component({
  selector: 'app-returned-orders',
  templateUrl: './returned-orders.component.html',
  styleUrl: './returned-orders.component.css'
})
export class ReturnedOrdersComponent implements OnInit {
  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';
  currentUser: User = new User();
  returnOrders: ReturnOrder[] = [];
  selectedReturn: ReturnOrder = {} as ReturnOrder;
  statuses: Status[] = [];
  requestParms: RequestParms = new RequestParms();
  orderMovementHistories: OrderMovementHistory[] = [];
  selectedRowsCount: number = 0;
  bulkStatusId: number = 0;
  bulkUpdateStatuses: Status[] = [];
  isBulkListReady: boolean = true;
  
  @ViewChild('returnOrderGrid') returnOrderGrid!: AgGridAngular;

  constructor(
    private router: Router,
    private iuser: IuserService,
    private ireturnOrder: IReturnOrderService,
    private statusService: StatusService,
    private snackBarService: SnackBarService,
    private iOrderMovementHistoryService: IOrderMovementHistoryService
  ) {
    this.currentUser = iuser.getCurrentUser();
  }

  colDefs: ColDef[] = [
    {
      headerName: "",
      field: "check",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 50,
      pinned: 'left',
      headerClass: 'text-center',
      cellClass: 'text-center'
    },
    { 
      headerName: "Return ID", 
      field: "ro_id", 
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
      field: "co_customer_name", 
      flex: 1.2,
      headerClass: 'text-start'
    },
    { 
      headerName: "Product", 
      field: "p_name", 
      flex: 1.5,
      headerClass: 'text-start'
    },
    { 
        headerName: "Amount", 
        field: "co_net_amount",
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
          const isApproved = val.toLowerCase().includes('approve');
          const isRejected = val.toLowerCase().includes('reject');
          const color = isApproved ? '#198754' : (isRejected ? '#dc3545' : '#6c757d');
          return `<span style="background-color: ${color}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">${val}</span>`;
        }
    },
    { headerName: "Bank Name", field: "ro_bank_name", width: 130, headerClass: 'text-start' },
    { headerName: "A/C No", field: "ro_account_no", width: 140, headerClass: 'text-start' },
    { headerName: "IFSC", field: "ro_ifsc_code", width: 110, headerClass: 'text-center', cellClass: 'text-center' },
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

  onAction(action: string, data: any) {
    this.selectedReturn = data;
    if (action === 'details') {
      this.getOrderMovementHistory(data.ro_order_no);
      $("#returnDetailModal").modal("show");
    } else if (action === 'statusChange') {
      $("#ReturnStatusModal").modal("show");
    }
  }

  getOrderMovementHistory(orderId: number) {
    this.iOrderMovementHistoryService.getOrderMovementHistoriesByOrder(orderId).subscribe(
      (data: OrderMovementHistory[]) => {
        this.orderMovementHistories = data;
      },
      (error: any) => {
      }
    );
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
}
