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
    'Comapny Address',
    'Company Phone',
    'Company Email',
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
    { headerName: "ID", field: "cv_id", width: 80 },
    { headerName: "Name", field: "cv_name" },
    { headerName: "Value", field: "cv_value" },
    {
      headerName: "Active",
      field: "cv_active_yn",
      cellRenderer: (p: any) => p.value === 'Y' ? 'Yes' : 'No'
    },
    { headerName: "Created By", field: "cv_cre_by_name" },
    { headerName: "Created Date", field: "cv_cre_date" },
    {
      headerName: 'Edit',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        name: 'Edit',
        cssClass: 'btn btn-info',
        icon: 'fa fa-edit',
        action: 'onEdit',
        onEdit: (data: any) => this.onAction('edit', data)
      }
    },
    {
      headerName: 'Delete',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        name: 'Delete',
        cssClass: 'btn btn-danger',
        icon: 'fa fa-trash',
        action: 'onDelete',
        onDelete: (data: any) => this.onAction('delete', data)
      }
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