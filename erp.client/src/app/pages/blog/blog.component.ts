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
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

declare var $: any;

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})

export class BlogComponent {
  private apiUrl = `${environment.serverHostAddress}/api/Blog`;
  attachmentUrl = `${environment.serverHostAddress}`;
  Editor = ClassicEditor;

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
    { 
      headerName: "ID", 
      field: "b_id", 
      width: 70, 
      cellClass: 'text-center fw-bold text-muted',
      headerClass: 'text-center'
    },
    { 
      headerName: "Blog Title", 
      field: "b_title", 
      flex: 1.2, 
      headerClass: 'text-start' 
    },
    {
      headerName: "Preview",
      field: "b_image_url",
      width: 120,
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: (p: any) =>
        p.value ? `<img src="${this.attachmentUrl}/${p.value}" class="rounded shadow-xs" width="80" height="40" style="object-fit:cover;">` : ''
    },
    {
      headerName: "Status",
      field: "b_active_yn",
      width: 100,
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: (p: any) => {
        const isActive = p.value === 'Y';
        return `<span class="grid-badge ${isActive ? 'bg-success' : 'bg-danger'} text-white shadow-xs">${isActive ? 'Published' : 'Draft'}</span>`;
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
            tooltip: 'Edit Blog',
            cssClass: 'btn btn-outline-info btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.onAction('edit', data)
          },
          {
            name: '',
            tooltip: 'Delete Blog',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDelete',
            onDelete: (data: any) => this.onAction('delete', data)
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

  config = {
    extraPlugins: [UploadAdapterPlugin],
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'imageUpload',
      'blockQuote',
      'undo',
      'redo'
    ]
  };

  onGridReady(params: GridReadyEvent) {
    params.api.sizeColumnsToFit();
  }


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


  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }


  createOrUpdateBlog() {
    if (this.blog.b_title != "" && this.selectedFile) {
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
    } else {
      this.snack.showSuccess('Please Enter Details');
    }
  }
}
class CustomUploadAdapter {
  private apiUrl = `${environment.serverHostAddress}/api/Blog`;
  constructor(private loader: any) { }

  upload() {
    return this.loader.file.then((file: File) => {
      const data = new FormData();
      data.append('upload', file);

      return fetch(this.apiUrl + '/upload-image', {
        method: 'POST',
        body: data
      })
        .then(res => res.json())
        .then(res => ({
          default: res.url
        }));
    });
  }

  abort() { }
}

class UploadAdapterPlugin {
  static pluginName = 'UploadAdapterPlugin';

  constructor(private editor: any) { }

  init() {
    this.editor.plugins.get('FileRepository').createUploadAdapter =
      (loader: any) => new CustomUploadAdapter(loader);
  }
}