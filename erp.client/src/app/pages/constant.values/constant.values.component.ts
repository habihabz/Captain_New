import { Component } from '@angular/core';
import { ColDef, DomLayoutType, GridReadyEvent } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { DbResult } from '../../models/dbresult.model';
import { SnackBarService } from '../../services/isnackbar.service';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { ConstantValue } from '../../models/constant.value.model';
import { IuserService } from '../../services/iuser.service';
import { IConstantValueService } from '../../services/iconstant.values.service';

declare var $: any;

@Component({
  selector: 'app-constant.values',
  templateUrl: './constant.values.component.html',
  styleUrl: './constant.values.component.css'
})
export class ConstantValuesComponent {

  pagination = true;
  paginationPageSize10 = 10;
  paginationPageSizeSelector10 = [10, 20, 50, 100];
  domLayout: DomLayoutType = 'autoHeight';
  constantsValues: ConstantValue[] = [];
  constantValue: ConstantValue = new ConstantValue();
  currentUser: User = new User();
  subscription: Subscription = new Subscription();

  constantNameList: string[] = [
    'Max Login Attempts',
    'Default Currency',
    'Company Name',
    'Tax Percentage',
    'Support Email',
    'Items Per Page',
    'Password Expiry Days',
    'Session Timeout Minutes',
    'Delivery Charge',
    'Return Policy Days',
    'Total Invoice Discount',
    'Company Address',
    'Company Phone',
    'Company Email',
    'Company Tax Reg Number',
    'Default Language',
  ];

  constructor(
    private constantService: IConstantValueService,
    private snack: SnackBarService,
    private iuserService: IuserService,
    private router: Router
  ) {
    this.currentUser = this.iuserService.getCurrentUser();
    if (this.currentUser.u_id === 0) {
      this.router.navigate(['login']);
    }
  }

  ngOnInit(): void {
    this.getConstantValues();
    this.subscription.add(
      this.constantService.refreshConstants$.subscribe(() => {
        this.getConstantValues();
      })
    );
  }

  // =======================
  // GRID CONFIG
  // =======================
  colDefs: ColDef[] = [
    { 
      headerName: "ID", 
      field: "cv_id", 
      width: 70, 
      cellClass: 'text-center fw-bold text-muted',
      headerClass: 'text-center'
    },
    { 
      headerName: "Configuration Name", 
      field: "cv_name", 
      flex: 1, 
      headerClass: 'text-start' 
    },
    { 
      headerName: "Setting Value", 
      field: "cv_value", 
      flex: 1.5,
      headerClass: 'text-start',
      cellClass: 'fw-bold text-primary'
    },
    {
      headerName: "Active",
      field: "cv_active_yn",
      width: 100,
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: (p: any) => {
        const isActive = p.value === 'Y';
        return `<span class="grid-badge ${isActive ? 'bg-success' : 'bg-danger'} text-white shadow-xs">${isActive ? 'Yes' : 'No'}</span>`;
      }
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
            tooltip: 'Edit Configuration',
            cssClass: 'btn btn-outline-info btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.onAction('edit', data)
          },
          {
            name: '',
            tooltip: 'Delete Configuration',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDelete',
            onDelete: (data: any) => this.onAction('delete', data)
          }
        ]
      }
    },
    { 
        headerName: "Created On", 
        field: "cv_cre_date", 
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
    filter: true
  };

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }

  // =======================
  // CRUD
  // =======================

  getConstantValues() {
    this.constantService.getConstantValues().subscribe((data: ConstantValue[]) => {
      this.constantsValues = data;
    });
  }

  openCreateModal() {
    this.constantValue = new ConstantValue();
    $("#cv_name").select2().val('').trigger('change');
    $('#constantModal').modal('show');
  }

  onEdit(row: ConstantValue) {
    this.constantValue = { ...row };
    $("#cv_name").select2().val(row.cv_name).trigger('change');
    $('#constantModal').modal('show');
  }

  onDelete(data: ConstantValue) {
    this.constantService.deleteConstantValue(data.cv_id).subscribe((res: DbResult) => {
      if (res.message === 'Success') {
        this.snack.showSuccess('Deleted successfully');
        this.constantService.refreshConstants();
      } else {
        this.snack.showError(res.message);
      }
    });
  }

  onAction(action: string, data: any) {
    if (action === 'edit') this.onEdit(data);
    if (action === 'delete') this.onDelete(data);
  }

  createOrUpdateConstantValue() {
    if (this.constantValue.cv_name != "") {

      this.constantValue.cv_cre_by = this.currentUser.u_id;

      this.constantService.createOrUpdateConstantValue(this.constantValue)
        .subscribe((res: DbResult) => {
          if (res.message === 'Success') {
            this.snack.showSuccess(
              this.constantValue.cv_id === 0
                ? 'Constant Created'
                : 'Constant Updated'
            );
            $('#constantModal').modal('hide');
            this.constantService.refreshConstants();
            this.constantValue = new ConstantValue();
          } else {
            this.snack.showError(res.message);
          }
        });

    } else {
      this.snack.showError('Please Enter Name');
    }
  }
  onConstantNameChange(name: any) {
    this.constantValue.cv_name = name;

  }
}