import { Component, OnInit, ViewChild } from '@angular/core';
import { Promocode } from '../../models/promocode.model';
import { IPromocodeService } from '../../services/ipromocode.service';
import { User } from '../../models/user.model';
import { IuserService } from '../../services/iuser.service';
import { SnackBarService } from '../../services/isnackbar.service';
import { DbResult } from '../../models/dbresult.model';
import { ColDef, DomLayoutType } from 'ag-grid-community';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { AgGridAngular } from 'ag-grid-angular';
import { RequestParms } from '../../models/requestParms';

declare var $: any;

@Component({
  selector: 'app-promocode',
  templateUrl: './promocode.component.html',
  styleUrls: ['./promocode.component.css']
})
export class PromocodeComponent implements OnInit {
  promocodes: Promocode[] = [];
  promocode: Promocode = new Promocode();
  currentUser: User = new User();
  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';
  requestParams: RequestParms = new RequestParms();

  @ViewChild('promocodeGrid') promocodeGrid!: AgGridAngular;

  colDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "pc_id",
      width: 80,
      cellClass: 'fw-bold text-muted',
      headerClass: 'ps-3'
    },
    {
      headerName: 'Code',
      field: 'pc_code',
      flex: 1.5,
      cellClass: 'fw-bold text-primary'
    },
    {
      headerName: 'Discount %',
      field: 'pc_discount_perc',
      width: 120,
      headerClass: 'text-center',
      cellClass: 'text-center',
      valueFormatter: params => `${params.value}%`
    },
    {
      headerName: 'Min Order',
      field: 'pc_min_order_amount',
      width: 130,
      headerClass: 'text-end',
      cellClass: 'text-end',
      valueFormatter: params => `₹${params.value}`
    },
    {
      headerName: 'Max Discount',
      field: 'pc_max_discount_amount',
      width: 140,
      headerClass: 'text-end',
      cellClass: 'text-end',
      valueFormatter: params => `₹${params.value}`
    },
    {
      headerName: 'Expiry',
      field: 'pc_expiry_date',
      width: 130,
      headerClass: 'text-center',
      cellClass: 'text-center',
      valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('en-GB') : 'No Expiry'
    },
    {
      headerName: 'Status',
      field: 'pc_active_yn',
      width: 100,
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: (params: any) => {
        const color = params.value === 'Y' ? '#198754' : '#dc3545';
        const text = params.value === 'Y' ? 'Active' : 'Inactive';
        return `<span style="background-color: ${color}; color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">${text}</span>`;
      }
    },
    {
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        actions: [
          {
            tooltip: 'Edit',
            cssClass: 'btn btn-outline-primary btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.editPromocode(data.pc_id)
          },
          {
            tooltip: 'Delete',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash-o',
            action: 'onDelete',
            onDelete: (data: any) => this.deletePromocode(data.pc_id)
          }
        ]
      }
    }
  ];

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  frameworkComponents = {
    actionRenderer: ActionRendererComponent
  };

  constructor(
    private promocodeService: IPromocodeService,
    private iuser: IuserService,
    private snackBarService: SnackBarService
  ) {
    this.currentUser = iuser.getCurrentUser();
  }

  ngOnInit(): void {
    this.getPromocodes();
    this.promocodeService.refresh$.subscribe(() => {
      this.getPromocodes();
    });
  }

  getPromocodes() {
    this.promocodeService.getPromocodes(this.requestParams).subscribe((data: Promocode[]) => {
      this.promocodes = data;
    });
  }

  createPromocode() {
    this.promocode = new Promocode();
    this.promocode.pc_cre_by = this.currentUser.u_id;
    $("#promocodeFormModal").modal("show");
  }

  editPromocode(id: number) {
    this.promocodeService.getPromocode(id).subscribe((data: Promocode) => {
      this.promocode = data;
      // Handle date formatting for input[type="date"]
      if (this.promocode.pc_expiry_date) {
          this.promocode.pc_expiry_date = new Date(this.promocode.pc_expiry_date).toISOString().split('T')[0];
      }
      $("#promocodeFormModal").modal("show");
    });
  }

  deletePromocode(id: number) {
      if (confirm('Are you sure you want to delete this promo code?')) {
          this.promocodeService.deletePromocode(id).subscribe((data: DbResult) => {
              if (data.message === "Success") {
                  this.snackBarService.showSuccess("Promo code deleted successfully.");
                  this.promocodeService.refresh();
              } else {
                  this.snackBarService.showError(data.message);
              }
          });
      }
  }

  savePromocode() {
    this.promocode.pc_cre_by = this.currentUser.u_id;
    this.promocodeService.createOrUpdatePromocode(this.promocode).subscribe((data: DbResult) => {
      if (data.message === "Success") {
        this.snackBarService.showSuccess(this.promocode.pc_id ? "Promo code updated successfully." : "Promo code created successfully.");
        $("#promocodeFormModal").modal("hide");
        this.promocodeService.refresh();
      } else {
        this.snackBarService.showError(data.message);
      }
    });
  }

  onGridReady(params: any) {
    setTimeout(() => {
        params.api.sizeColumnsToFit();
    }, 500);
  }
}
