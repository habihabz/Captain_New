import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Supplier } from '../../models/supplier.model';
import { IuserService } from '../../services/iuser.service';
import { DbResult } from '../../models/dbresult.model';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { ISupplierService } from '../../services/isupplier.service';
declare var $: any;

import { ColDef, DomLayoutType } from 'ag-grid-community';
import { ActionRendererComponent } from '../../directives/action.renderer';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css'
})
export class SupplierComponent implements OnInit, OnDestroy {
  suppliers: Supplier[] = [];
  supplier: Supplier = new Supplier();
  currentUser: User = new User();
  dbResult: DbResult = new DbResult();
  private subscription: Subscription = new Subscription();
  
  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';

  colDefs: ColDef[] = [
    { 
      headerName: "ID", 
      field: "s_id", 
      width: 70, 
      cellClass: 'text-center fw-bold text-muted'
    },
    { 
      headerName: "Supplier Name", 
      field: "s_name", 
      flex: 1.2,
      cellClass: 'fw-bold text-dark'
    },
    { 
      headerName: "Contact Number", 
      field: "s_mobile", 
      width: 150,
      cellClass: 'text-center'
    },
    { 
      headerName: "Email Address", 
      field: "s_email", 
      flex: 1.5 
    },
    { 
      headerName: "Address", 
      field: "s_address", 
      flex: 1.5,
      cellClass: 'text-muted small'
    },
    {
      headerName: 'Actions',
      width: 150,
      pinned: 'right',
      cellClass: 'text-center',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        actions: [
          {
            name: '',
            tooltip: 'Edit Supplier',
            cssClass: 'btn btn-outline-info btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.editSupplier(data.s_id)
          },
          {
            name: '',
            tooltip: 'Delete Supplier',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDelete',
            onDelete: (data: any) => this.deleteSupplier(data.s_id)
          }
        ]
      }
    },
    { 
        headerName: "Created On", 
        field: "s_cre_date", 
        width: 130, 
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

  constructor(private iuserService: IuserService, private isupplierService: ISupplierService, private router: Router) { 
    this.currentUser = iuserService.getCurrentUser();
    if(this.currentUser.u_id == 0) { 
      this.router.navigate(['login']);
    }
  }

  ngOnInit(): void {
    this.loadSuppliers();
    this.subscription.add(
      this.isupplierService.refreshSuppliers$.subscribe(() => {
        this.loadSuppliers();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadSuppliers(): void {
    this.isupplierService.getSuppliers().subscribe(
      (data: Supplier[]) => {
        this.suppliers = data;
      },
      (error: any) => {
        console.error('Error fetching suppliers', error);
      }
    );
  }

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
  }

  createOrUpdateSupplier(): void {
    this.supplier.s_cre_by = this.currentUser.u_id;
    this.isupplierService.createOrUpdateSupplier(this.supplier).subscribe(
      (data: DbResult) => {
        if (data.message === "Success") {
          this.isupplierService.refreshSuppliers();
          $('#supplierFormModal').modal('hide');
        } else {
          alert(data.message);
        }
      }
    );
  }

  deleteSupplier(id: number): void {
    if(confirm("Are you sure you want to delete this supplier?")) {
      this.isupplierService.deleteSupplier(id).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            this.isupplierService.refreshSuppliers();
          } else {
            alert(data.message);
          }
        }
      );
    }
  }

  editSupplier(id: number): void {
    this.isupplierService.getSupplier(id).subscribe(
      (data: Supplier) => {
        this.supplier = data;
        $('#supplierFormModal').modal('show');
      }
    );
  }

  createSupplier(): void {
    this.supplier = new Supplier();
    $('#supplierFormModal').modal('show');
  }
}

