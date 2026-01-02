import { Component, ElementRef, ViewChild } from '@angular/core';
import { ColDef, DomLayoutType, GridReadyEvent } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

import { User } from '../../models/user.model';
import { DbResult } from '../../models/dbresult.model';

import { SnackBarService } from '../../services/isnackbar.service';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { Blog } from '../../models/blog.model';
import { IBlogService } from '../../services/iblog.service';
import { IuserService } from '../../services/iuser.service';

declare var $: any;

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {

  attachmentUrl = `${environment.serverHostAddress}`;

  pagination = true;
  paginationPageSize10 = 10;
  paginationPageSizeSelector10 = [10, 20, 50, 100];
  domLayout: DomLayoutType = 'autoHeight';

  blogs: Blog[] = [];
  blog: Blog = new Blog();

  selectedFile: File | null = null;
  currentUser: User = new User();
  subscription: Subscription = new Subscription();

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private iblogService: IBlogService,
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
    this.getBlogs();
    this.subscription.add(
      this.iblogService.refreshBlogs$.subscribe(() => {
        this.getBlogs();
      })
    );
  }

  // =======================
  // GRID CONFIG
  // =======================
  colDefs: ColDef[] = [
    { headerName: "ID", field: "b_id", width: 80 },
    { headerName: "Title", field: "b_title" },
    { headerName: "Description", field: "b_description" },
    {
      headerName: "Cover",
      field: "b_image_url",
      cellRenderer: (p: any) =>
        `<img src="${this.attachmentUrl}/${p.value}" width="60" height="40" style="object-fit:cover;">`
    },
    {
      headerName: "Active",
      field: "b_active_yn",
      cellRenderer: (p: any) => p.value === 'Y' ? 'Yes' : 'No'
    },
    {
      headerName: 'Edit',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        name: 'Edit',
        action: 'onEdit',
        cssClass: 'btn btn-info',
        icon: 'fa fa-edit',
        onEdit: (data: any) => this.onAction('edit', data)
      }
    },
    {
      headerName: 'Delete',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        name: 'Delete',
        action: 'onDelete',
        cssClass: 'btn btn-danger',
        icon: 'fa fa-trash',
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
  getBlogs() {
    this.iblogService.getBlogs().subscribe(res => {
      this.blogs = res;
    });
  }

  openCreateModal() {
    this.blog = new Blog();
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    $('#blogModal').modal('show');
  }

  onEdit(row: Blog) {
    this.blog = { ...row };
    this.selectedFile = null;
    $('#blogModal').modal('show');
  }

  onDelete(data: Blog) {
    this.iblogService.deleteBlog(data.b_id).subscribe((res: DbResult) => {
      if (res.message === 'Success') {
        this.snack.showSuccess('Deleted successfully');
        this.iblogService.refreshBlogs();
      } else {
        this.snack.showError(res.message);
      }
    });
  }

  onAction(action: string, data: any) {
    if (action === 'edit') this.onEdit(data);
    if (action === 'delete') this.onDelete(data);
  }

  // =======================
  // FILE
  // =======================
  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // =======================
  // SAVE
  // =======================
  createOrUpdateBlog() {
    const form = new FormData();
    form.append('b_id', this.blog.b_id.toString());
    form.append('b_title', this.blog.b_title);
    form.append('b_description', this.blog.b_description);
    form.append('b_content', this.blog.b_content);
    form.append('b_active_yn', this.blog.b_active_yn);
    form.append('b_cre_by', this.currentUser.u_id.toString());

    if (this.selectedFile) {
      form.append('image', this.selectedFile);
    }

    this.iblogService.createOrUpdateBlog(form).subscribe(res => {
      if (res.message === 'Success') {
        this.snack.showSuccess(
          this.blog.b_id === 0 ? 'Blog Created' : 'Blog Updated'
        );
        $('#blogModal').modal('hide');
        this.iblogService.refreshBlogs();
        this.blog = new Blog();
        this.selectedFile = null;
      } else {
        this.snack.showError(res.message);
      }
    });
  }

}
