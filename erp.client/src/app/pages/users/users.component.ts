import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IuserService } from '../../services/iuser.service';
import { IroleService } from '../../services/irole.service';
import { User } from '../../models/user.model';
import { DbResult } from '../../models/dbresult.model';
import { Role } from '../../models/role.model';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Select2Directive } from '../../directives/select2.directive';
import { ColDef, DomLayoutType } from 'ag-grid-community';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { environment as Env } from '../../../environments/environment';
declare var $: any;

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  allUsers: User[] = [];
  user: User = new User();
  roles: Role[] = [];
  dbResult: DbResult = new DbResult();
  currentUser: User = new User();
  role: any = 0;
  selectedRoleFilter: any = 0;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  private subscription: Subscription = new Subscription();
  
  pagination = true;
  domLayout: DomLayoutType = 'autoHeight';

  colDefs: ColDef[] = [
    { 
      headerName: "Profile", 
      field: "u_image_url", 
      width: 80, 
      cellClass: 'text-center',
      cellRenderer: (p: any) => {
        const url = p.value ? Env.serverHostAddress + p.value : 'images/img.jpg';
        return `<img src="${url}" style="width: 32px; height: 32px; border-radius: 50%; border: 1px solid #ddd; object-fit: cover;">`;
      }
    },
    { 
      headerName: "ID", 
      field: "u_id", 
      width: 70, 
      cellClass: 'text-center fw-bold text-muted'
    },
    { 
      headerName: "Full Name", 
      field: "u_name", 
      flex: 1.2,
      cellClass: 'fw-bold text-dark'
    },
    { 
      headerName: "Username", 
      field: "u_username", 
      flex: 1,
      cellClass: 'text-primary'
    },
    { 
      headerName: "Email", 
      field: "u_email", 
      flex: 1.2,
      cellClass: 'text-muted'
    },
    { 
      headerName: "Phone", 
      field: "u_phone", 
      width: 130,
      cellClass: 'text-muted'
    },
    { 
      headerName: "Date of Birth", 
      field: "u_date_of_birth", 
      width: 130,
      cellClass: 'text-muted',
      valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString('en-GB') : ''
    },
    { 
      headerName: "Role", 
      field: "u_role_name", 
      width: 150,
      cellRenderer: (p: any) => `<span class="grid-badge bg-info text-white shadow-xs">${p.value || ''}</span>`
    },
    { 
      headerName: "Active", 
      field: "u_active_yn", 
      width: 90,
      cellClass: 'text-center',
      cellRenderer: (p: any) => {
        const isActive = p.value === 'Y';
        return `<span class="grid-badge ${isActive ? 'bg-success' : 'bg-danger'} text-white shadow-xs">${isActive ? 'Yes' : 'No'}</span>`;
      }
    },
    { 
        headerName: "Created On", 
        field: "u_cre_date", 
        width: 130, 
        cellClass: 'text-center',
        valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString('en-GB') : ''
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
            tooltip: 'Edit User',
            cssClass: 'action-btn btn-edit',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.editUser(data.u_id)
          },
          {
            name: '',
            tooltip: 'Change Password',
            cssClass: 'action-btn btn-password',
            icon: 'fa fa-key',
            action: 'onPassword',
            onPassword: (data: any) => this.openPasswordModal(data.u_id)
          },
          {
            name: '',
            tooltip: 'Delete User',
            cssClass: 'action-btn btn-delete',
            icon: 'fa fa-trash-o',
            action: 'onDelete',
            onDelete: (data: any) => this.deleteUser(data.u_id)
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

  constructor(private iuserService: IuserService, private iroleService: IroleService, private elRef: ElementRef, private cdr: ChangeDetectorRef, private router: Router) {
    this.currentUser = iuserService.getCurrentUser();
    if(this.currentUser.u_id == 0) { 
      this.router.navigate(['login']);
    }
  }

  ngOnInit(): void {
    this.loadUsers();
    this.subscription.add(
      this.iuserService.refreshUsers$.subscribe(() => {
        this.loadUsers();
      })
    );
    this.loadRoles();
  }

  loadUsers() {
    this.iuserService.getUsers().subscribe(
      (data: User[]) => {
        this.allUsers = data;
        this.applyRoleFilter();
      },
      (error: any) => {
        console.error('Error fetching users', error);
      }
    );
  }

  onRoleFilterChange(event: any) {
    this.selectedRoleFilter = event;
    this.applyRoleFilter();
  }

  applyRoleFilter() {
    if (!this.selectedRoleFilter || this.selectedRoleFilter == 0) {
      this.users = [...this.allUsers];
    } else {
      this.users = this.allUsers.filter(u => u.u_role_id == this.selectedRoleFilter);
    }
  }

  loadRoles() {
    this.iroleService.getRoles().subscribe(
      (data: Role[]) => {
        this.roles = data;
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error fetching roles', error);
      }
    );
  }

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
  }

  deleteUser(id: number) {
    if(confirm("Are you sure you want to delete this user?")) {
      this.iuserService.deleteUser(id).subscribe(
        (data: DbResult) => {
          if (data.message === 'Success') {
            this.iuserService.refreshUsers();
          } else {
            alert(data.message);
          }
        }
      );
    }
  }

  createOrUpdateUser(): void {
    this.user.u_cre_by = this.currentUser.u_id;
    this.user.u_role_id = this.role;
    this.iuserService.createOrUpdateUser(this.user).subscribe(
      (data: DbResult) => {
        if(data.message == "Success") {
          const userId = this.user.u_id || data.id;
          
          if (this.selectedFile && userId) {
            this.iuserService.uploadProfileImage(userId, this.selectedFile).subscribe(() => {
              this.iuserService.refreshUsers();
              this.closeModal();
            });
          } else {
            this.iuserService.refreshUsers();
            this.closeModal();
          }
        } else {
          alert(data.message);
        }
      }
    );
  }

  onProfileFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  editUser(id: number): void {
    this.iuserService.getUser(id).subscribe(
      (data: User) => {
        this.user = data;
        this.role = data.u_role_id;
        this.selectedFile = null;
        this.previewUrl = data.u_image_url ? Env.serverHostAddress + data.u_image_url : null;
        $('#userFormModal').modal('show');
      }
    );
  }

  createUser(): void {
    this.user = new User();
    this.role = 0;
    this.selectedFile = null;
    this.previewUrl = null;
    $('#userFormModal').modal('show');
  }

  closeModal() {
    this.user = new User();
    $('#userFormModal').modal("hide");
  }

  OnRoleChange(r_id:any ){
    this.role = r_id;
  }

  // Password Management
  newPassword = "";
  selectedUserId = 0;

  openPasswordModal(id: number) {
    this.selectedUserId = id;
    this.newPassword = "";
    $('#passwordModal').modal('show');
  }

  updatePassword() {
    if(!this.newPassword) {
      alert("Please enter a new password");
      return;
    }
    
    this.iuserService.updatePassword(this.selectedUserId, this.newPassword).subscribe(
      (data: DbResult) => {
        if(data.message == "Success") {
          alert("Password updated successfully");
          $('#passwordModal').modal('hide');
        } else {
          alert(data.message);
        }
      }
    );
  }

  // Image Management
  isUploading = false;
  serverUrl = Env.serverHostAddress;

  onFileSelected(event: any, userId: number) {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.iuserService.uploadProfileImage(userId, file).subscribe(
        (data: DbResult) => {
          this.isUploading = false;
          if (data.message === 'Success') {
            this.iuserService.refreshUsers();
          } else {
            alert(data.message);
          }
        },
        (error) => {
          this.isUploading = false;
          console.error('Upload failed', error);
        }
      );
    }
  }
}
