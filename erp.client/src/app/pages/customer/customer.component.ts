import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { IuserService } from '../../services/iuser.service';
import { DbResult } from '../../models/dbresult.model';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';
import { ColDef, DomLayoutType } from 'ag-grid-community';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { ICustomerService } from '../../services/icustomer.service';
declare var $: any;

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent implements OnInit, OnDestroy {
  customers: any[] = [];
  customer: User = new User();
  currentUser: User = new User();
  dbResult: DbResult = new DbResult();
  private subscription: Subscription = new Subscription();

  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';

  colDefs: ColDef[] = [
    {
      headerName: "ID",
      field: "u_id",
      width: 70,
      cellClass: 'text-center fw-bold text-muted'
    },
    {
      headerName: "Name",
      field: "u_name",
      flex: 1.2,
      cellClass: 'fw-bold text-dark'
    },
    {
      headerName: "Phone Number",
      field: "u_phone",
      width: 140,
      cellClass: 'text-center'
    },
    {
      headerName: "Email Address",
      field: "u_email",
      flex: 1.5
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
            tooltip: 'Edit Customer',
            cssClass: 'btn btn-outline-info btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.editCustomer(data.u_id)
          },
          {
            name: '',
            tooltip: 'Delete Customer',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDelete',
            onDelete: (data: any) => this.deleteCustomer(data.u_id)
          }
        ]
      }
    },
    {
      headerName: "Joined On",
      field: "u_cre_date",
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

  constructor(private iuserService: IuserService, private icustomerService: ICustomerService, private router: Router) {
    this.currentUser = iuserService.getCurrentUser();
    if (this.currentUser.u_id == 0) {
      this.router.navigate(['login']);
    }
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.subscription.add(
      this.icustomerService.refreshCustomers$.subscribe(() => {
        this.loadCustomers();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadCustomers(): void {
    this.icustomerService.getCustomers().subscribe(
      (data: any[]) => {
        this.customers = data;
      },
      (error: any) => {
        console.error('Error fetching customers', error);
      }
    );
  }

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
  }

  createOrUpdateCustomer(): void {
    this.customer.u_cre_by = this.currentUser.u_id;
    this.icustomerService.createOrUpdateCustomer(this.customer).subscribe(
      (data: DbResult) => {
        this.dbResult = data;
        if (data.message === "Success") {
          this.icustomerService.refreshCustomers();
          $('#customerFormModal').modal('hide');
        } else {
          alert(data.message);
        }
      },
      (error: any) => {
        console.error('Error creating/updating customer', error);
      }
    );
  }

  deleteCustomer(id: number): void {
    if (confirm("Are you sure you want to delete this customer?")) {
      this.icustomerService.deleteCustomer(id).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            this.icustomerService.refreshCustomers();
          } else {
            alert(data.message);
          }
        }
      );
    }
  }

  editCustomer(id: number): void {
    this.icustomerService.getCustomer(id).subscribe(
      (data: any) => {
        this.customer = data;
        $('#customerFormModal').modal('show');
      }
    );
  }

  createCustomer(): void {
    this.customer = new User();
    $('#customerFormModal').modal('show');
  }
}
