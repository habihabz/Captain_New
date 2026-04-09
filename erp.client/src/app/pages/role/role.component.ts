import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Role } from '../../models/role.model';
import { IuserService } from '../../services/iuser.service';
import { IroleService } from '../../services/irole.service';
import { DbResult } from '../../models/dbresult.model';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

declare var $: any;

import { ColDef, DomLayoutType } from 'ag-grid-community';
import { ActionRendererComponent } from '../../directives/action.renderer';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit, OnDestroy {
  roles: Role[] = [];
  role: Role = new Role();
  currentUser: User = new User();
  dbResult: DbResult = new DbResult();
  private subscription: Subscription = new Subscription();
  
  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';

  colDefs: ColDef[] = [
    { 
      headerName: "ID", 
      field: "r_id", 
      width: 70, 
      cellClass: 'text-center fw-bold text-muted'
    },
    { 
      headerName: "Role Name", 
      field: "r_name", 
      flex: 1,
      cellClass: 'fw-bold text-dark'
    },
    { 
      headerName: "Description", 
      field: "r_description", 
      flex: 2,
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
            tooltip: 'Edit Role',
            cssClass: 'btn btn-outline-info btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.editRole(data.r_id)
          },
          {
            name: '',
            tooltip: 'Delete Role',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDelete',
            onDelete: (data: any) => this.deleteRole(data.r_id)
          }
        ]
      }
    },
    { 
        headerName: "Created On", 
        field: "r_cre_date", 
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

  constructor(private iuserService: IuserService, private iroleService: IroleService, private router: Router) { 
    this.currentUser = iuserService.getCurrentUser();
    if(this.currentUser.u_id == 0) { 
      this.router.navigate(['login']);
    }
  }

  ngOnInit(): void {
    this.loadRoles();
    this.subscription.add(
      this.iroleService.refreshRoles$.subscribe(() => {
        this.loadRoles();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadRoles(): void {
    this.iroleService.getRoles().subscribe(
      (data: Role[]) => {
        this.roles = data;
      },
      (error: any) => {
        console.error('Error fetching roles', error);
      }
    );
  }

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
  }

  createOrUpdateRole(): void {
    this.role.r_cre_by = this.currentUser.u_id;
    this.iroleService.createOrUpdateRole(this.role).subscribe(
      (data: DbResult) => {
        if (data.message === "Success") {
          this.iroleService.refreshRoles();
          $('#roleFormModal').modal('hide');
        } else {
          alert(data.message);
        }
      }
    );
  }

  deleteRole(id: number): void {
    if(confirm("Are you sure you want to delete this role?")) {
      this.iroleService.deleteRole(id).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            this.iroleService.refreshRoles();
          } else {
            alert(data.message);
          }
        }
      );
    }
  }

  editRole(id: number): void {
    this.iroleService.getRole(id).subscribe(
      (data: Role) => {
        this.role = data;
        $('#roleFormModal').modal('show');
      }
    );
  }

  createRole(): void {
    this.role = new Role();
    $('#roleFormModal').modal('show');
  }
}
