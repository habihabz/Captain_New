import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DbResult } from '../../../models/dbresult.model';
import { User } from '../../../models/user.model';
import { PackagingType } from '../../../models/packaging.type.model';
import { IuserService } from '../../../services/iuser.service';
import { Router } from '@angular/router';
import { PackagingTypeService } from '../../../services/packaging.type.service';
import { ColDef, DomLayoutType } from 'ag-grid-community';
import { ActionRendererComponent } from '../../../directives/action.renderer';
declare var $: any;

@Component({
  selector: 'app-packaging-type',
  templateUrl: './packaging-type.component.html',
  styleUrls: ['./packaging-type.component.css']
})
export class PackagingTypeComponent implements OnInit, OnDestroy {
  packagingTypes: PackagingType[] = [];
  packagingType: PackagingType = new PackagingType();
  currentUser: User = new User();
  
  private subscription: Subscription = new Subscription();
  
  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';

  colDefs: ColDef[] = [
    { 
      headerName: "ID", 
      field: "pt_id", 
      width: 70, 
      cellClass: 'text-center fw-bold text-muted'
    },
    { 
      headerName: "Type Name", 
      field: "pt_name", 
      flex: 1.5,
      cellClass: 'fw-bold text-dark'
    },
    { 
      headerName: "Length (cm)", 
      field: "pt_length", 
      width: 120,
      cellClass: 'text-center'
    },
    { 
      headerName: "Breadth (cm)", 
      field: "pt_breadth", 
      width: 120,
      cellClass: 'text-center'
    },
    { 
      headerName: "Height (cm)", 
      field: "pt_height", 
      width: 120,
      cellClass: 'text-center'
    },
    { 
      headerName: "Pkg Type", 
      field: "pt_pkg_type", 
      width: 120,
      cellRenderer: (p: any) => `<span class="grid-badge bg-light text-muted border shadow-xs">${p.value || ''}</span>`
    },
    { 
      headerName: "Active", 
      field: "pt_active_yn", 
      width: 100,
      cellClass: 'text-center',
      cellRenderer: (p: any) => {
        const isActive = p.value === 'Y';
        return `<span class="grid-badge ${isActive ? 'bg-success' : 'bg-danger'} text-white shadow-xs">${isActive ? 'Active' : 'Inactive'}</span>`;
      }
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
            tooltip: 'Edit Record',
            cssClass: 'btn btn-outline-info btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.editPackagingType(data.pt_id)
          },
          {
            name: '',
            tooltip: 'Delete Record',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDelete',
            onDelete: (data: any) => this.deletePackagingType(data.pt_id)
          }
        ]
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

  constructor(
    private iuserService: IuserService, 
    private packagingTypeService: PackagingTypeService, 
    private router: Router
  ) { 
    this.currentUser = iuserService.getCurrentUser();
    if(this.currentUser.u_id == 0) { 
      this.router.navigate(['login']);
    }
  }

  ngOnInit(): void {
    this.getPackagingTypes();
    this.subscription.add(
      this.packagingTypeService.refreshPackagingTypes$.subscribe(() => {
        this.getPackagingTypes();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
  }

  getPackagingTypes(): void {
    this.packagingTypeService.getPackagingTypes().subscribe(
      (data: PackagingType[]) => {
        this.packagingTypes = data;
      },
      (error: any) => {
        console.error('Error fetching packaging types', error);
      }
    );
  }

  createOrUpdatePackagingType(): void {
    this.packagingType.pt_cre_by = this.currentUser.u_id;
    this.packagingTypeService.createOrUpdatePackagingType(this.packagingType).subscribe(
      (data: DbResult) => {
        if (data.message === "Success") {
          this.packagingTypeService.refreshPackagingTypes();
          $('#packagingTypeModal').modal('hide');
        } else {
          alert(data.message);
        }
      }
    );
  }

  deletePackagingType(id: number): void {
    if(confirm("Are you sure you want to delete this packaging type?")) {
      this.packagingTypeService.deletePackagingType(id).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            this.packagingTypeService.refreshPackagingTypes();
          } else {
            alert(data.message);
          }
        }
      );
    }
  }

  editPackagingType(id: number): void {
    this.packagingTypeService.getPackagingType(id).subscribe(
      (data: PackagingType) => {
        this.packagingType = data;
        $('#packagingTypeModal').modal('show');
      }
    );
  }

  createPackagingType(): void {
    this.packagingType = new PackagingType();
    $('#packagingTypeModal').modal('show');
  }
}
