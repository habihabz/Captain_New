import { Component, ChangeDetectionStrategy, ElementRef, OnInit, ViewChild } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { GridService } from '../../services/igrid.service';
import { AgGridAngular } from 'ag-grid-angular';
import { IuserService } from '../../services/iuser.service';
import { Router } from '@angular/router';
import { ICustomerService } from '../../services/icustomer.service';
import { SnackBarService } from '../../services/isnackbar.service';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs/internal/Subscription';
import { ColDef, DomLayoutType, GridReadyEvent } from 'ag-grid-community';
import { ActionRendererComponent } from '../../directives/action.renderer';
import { IProductService } from '../../services/iproduct.service';
import { Product } from '../../models/product.model';
import { IMasterDataService } from '../../services/imaster.data.service';
import { ICategoryService } from '../../services/icategory.service';
import { Category } from '../../models/category.model';
import { DbResult } from '../../models/dbresult.model';
import { MasterData } from '../../models/master.data.model';
import { RequestParms } from '../../models/requestParms';
import { ProdSize } from '../../models/prod.size.model';
import { ProdColor } from '../../models/prod.color.model';
import { Barcode } from '../../models/barcode.model';
import { ProdAttachement } from '../../models/prod.attachments.model';
import { environment } from '../../../environments/environment';


declare var $: any;

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  pagination = true;
  paginationPageSize5 = 5;
  paginationPageSizeSelector5 = [5, 10, 20, 50, 100];
  paginationPageSize10 = 10;
  paginationPageSizeSelector10 = [10, 20, 50, 100];
  domLayout: DomLayoutType = 'autoHeight';
  currentUser: User = new User();
  subscription: Subscription = new Subscription();
  products: Product[] = [];
  product: Product = new Product();
  dbResult: DbResult = new DbResult();
  categories: Category[] = [];
  subcategories: MasterData[] = [];
  divisions: MasterData[] = [];
  subdivisions: MasterData[] = [];
  sizes: MasterData[] = [];
  colors: MasterData[] = [];
  requestParms: RequestParms = new RequestParms();
  newBarcode: string = '';
  prodSize: ProdSize = new ProdSize();
  prodSizes: ProdSize[] = [];
  prodColor: ProdColor = new ProdColor();
  prodColors: ProdColor[] = [];
  barcode: Barcode = new Barcode();
  barcodes: Barcode[] = [];
  prodAttachements: ProdAttachement[] = [];
  imagePreviews: string[] = [];
  selectedFiles: File[] = [];
  selectedColor: number = 0;
  imageItems: any[] = [];


  @ViewChild('productsGrid') productsGrid!: AgGridAngular;
  @ViewChild('barcodeGrid') barcodeGrid!: AgGridAngular;
  @ViewChild('prodSizeGrid') prodSizeGrid!: AgGridAngular;
  @ViewChild('prodColorGrid') prodColorGrid!: AgGridAngular;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('barcodeInput', { static: false }) barcodeInput!: ElementRef;


  constructor(
    private iuserService: IuserService,
    private elRef: ElementRef,
    private router: Router,
    private icustomerService: ICustomerService,
    private snackBarService: SnackBarService,
    private igridService: GridService,
    private iproductService: IProductService,
    private imasterDataService: IMasterDataService,
    private icategoryService: ICategoryService,



  ) {
    this.currentUser = iuserService.getCurrentUser();
    if (this.currentUser.u_id === 0) {
      this.router.navigate(['login']);
    }
  }

  colDefs: ColDef[] = [
    { 
      headerName: "ID", 
      field: "p_id", 
      width: 80,
      cellClass: 'text-center fw-bold text-muted'
    },
    { 
      headerName: "Product Name", 
      field: "p_name", 
      flex: 1.5
    },
    { 
      headerName: "Short Name", 
      field: "p_short_name", 
      width: 150
    },
    { 
      headerName: "Category", 
      field: "p_category_name", 
      width: 180,
      cellRenderer: (p: any) => `<span class="grid-badge bg-light text-dark shadow-xs border">${p.value || ''}</span>`
    },
    { 
      headerName: "Sub Category", 
      field: "p_sub_category_name", 
      width: 180
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
            name: '', // Empty name for icon-only
            tooltip: 'Attachments',
            cssClass: 'btn btn-outline-default btn-xs rounded-pill me-1',
            icon: 'fa fa-image',
            action: 'onAttachments',
            onAttachments: (data: any) => this.onAction('attachments', data)
          },
          {
            name: '', 
            tooltip: 'Edit Product',
            cssClass: 'btn btn-outline-info btn-xs rounded-pill me-1',
            icon: 'fa fa-pencil',
            action: 'onEdit',
            onEdit: (data: any) => this.onAction('edit', data)
          },
          {
            name: '', 
            tooltip: 'Delete Product',
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
        field: "p_cre_date", 
        width: 130,
        cellClass: 'text-center',
        valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString('en-GB') : ''
    }
  ];

  barcodeColDefs: ColDef[] = [
    { headerName: "ID", field: "b_id", width: 70, cellClass: 'text-center fw-bold text-muted', headerClass: 'text-center' },
    { headerName: "Barcode Value", field: "b_bar_code", flex: 1, cellClass: 'fw-bold', headerClass: 'text-start' },
    {
      headerName: 'Action',
      width: 100,
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        actions: [
          {
            name: '',
            tooltip: 'Delete Barcode',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDeleteBarcode',
            onDeleteBarcode: (data: any) => this.onAction('deleteBarcode', data)
          }
        ]
      }
    }
  ];

  prodSizeColDefs: ColDef[] = [
    { headerName: "ID", field: "ps_id", width: 70, cellClass: 'text-center fw-bold text-muted', headerClass: 'text-center' },
    { headerName: "Size Name", field: "ps_size_name", flex: 1, cellClass: 'fw-bold', headerClass: 'text-start' },
    {
      headerName: 'Action',
      width: 100,
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        actions: [
          {
            name: '',
            tooltip: 'Delete Size',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDeleteProdSize',
            onDeleteProdSize: (data: any) => this.onAction('deleteProdSize', data)
          }
        ]
      }
    }
  ];

  prodColorColDefs: ColDef[] = [
    { headerName: "ID", field: "pc_id", width: 70, cellClass: 'text-center fw-bold text-muted', headerClass: 'text-center' },
    { headerName: "Color Name", field: "pc_color_name", flex: 1, cellClass: 'fw-bold', headerClass: 'text-start' },
    {
      headerName: 'Action',
      width: 100,
      headerClass: 'text-center',
      cellClass: 'text-center',
      cellRenderer: 'actionRenderer',
      cellRendererParams: {
        actions: [
          {
            name: '',
            tooltip: 'Delete Color',
            cssClass: 'btn btn-outline-danger btn-xs rounded-pill',
            icon: 'fa fa-trash',
            action: 'onDeleteProdColor',
            onDeleteProdColor: (data: any) => this.onAction('deleteProdColor', data)
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

  ngOnInit(): void {
    this.getProducts();
    this.loadCategories();
    this.subscription.add(
      this.iproductService.refreshProducts$.subscribe(() => {
        this.getProducts();
      })

    );

    this.getMasterDatasByType("SubCategory", (data) => { this.subcategories = data; });
    this.getMasterDatasByType("Division", (data) => { this.divisions = data; });
    this.getMasterDatasByType("SubDivision", (data) => { this.subdivisions = data; });
    this.getMasterDatasByType("ProductSize", (data) => { this.sizes = data; });
    this.getMasterDatasByType("ProductColor", (data) => { this.colors = data; });
  }
  loadCategories(): void {
    this.icategoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
      },
      (error: any) => {
        this.snackBarService.showError('Error fetching categories ' + error);
      }
    );
  }
  getMasterDatasByType(masterType: string, callback: (data: MasterData[]) => void): void {
    this.requestParms = new RequestParms();
    this.requestParms.type = masterType;
    this.imasterDataService.getMasterDatasByType(this.requestParms).subscribe(
      (data: MasterData[]) => {
        callback(data);  // Pass the data to the callback function
      },
      (error: any) => {
        this.snackBarService.showError('Error fetching master data ' + error);
        callback([]);  // Pass an empty array if there's an error
      }
    );
  }

  onAction(action: string, data: any) {
    switch (action) {
      case 'edit':
        this.onEdit(data);
        break;
      case 'delete':
        this.onDelete(data);
        break;
      case 'detail':
        this.onDetail(data);
        break;
      case 'deleteBarcode':
        this.onDeleteBarcode(data);
        break;
      case 'deleteProdSize':
        this.onDeleteProdSize(data);
        break;
      case 'deleteProdColor':
        this.onDeleteProdColor(data);
        break;
      case 'attachments':
        this.onAttachments(data);
        break;
      default:
        this.snackBarService.showError("Unknown Action " + action);;
    }
  }

  onAttachments(data: any) {
    this.product = data;
    this.imageItems = [];
    this.selectedFiles = [];
    this.refreshAttachmentGallery();
    $('#AttachementModal').modal('show');
  }

  refreshAttachmentGallery() {
    this.requestParms.id = this.product.p_id;
    this.requestParms.color = this.selectedColor;

    this.iproductService.getProductAttachementsByColor(this.requestParms)
      .subscribe((data: any[]) => {
        // Keep ONLY the locally added 'new' images that match THIS CURRENT variation, then add the refreshed set of 'existing' ones from the server
        this.imageItems = this.imageItems.filter(x => x.type === 'new' && x.color === this.selectedColor);
        data.forEach((x: any) => {
          this.imageItems.push({
            id: x.pa_id,
            preview: `${environment.serverHostAddress}/${x.pa_image_path}`,
            type: 'existing'
          });
        });
      });
  }

  onEdit(data: any) {
    $('#myTab a[href="#details"]').tab('show');
    this.iproductService.getProduct(data.p_id).subscribe(
      (data: Product) => {
        this.product = data;

        this.barcodes = this.parseJSON(data.p_barcodes);
        this.prodSizes = this.parseJSON(data.p_sizes);
        this.updateGrid(this.barcodeGrid, this.barcodes);
        this.updateGrid(this.prodSizeGrid, this.prodSizes);

        this.imagePreviews = this.prodAttachements.map(
          (x) => `${environment.serverHostAddress}/${x.pa_image_path}`
        );
        this.setSelect2Values();
        $('#productFormModal').modal('show');


      },
      (error: any) => {
        console.error('Error fetching product', error);
      }
    );
  }

  // Helper to parse JSON fields safely
  private parseJSON(value: any): any {
    return typeof value === 'string' ? JSON.parse(value) : value;
  }

  // Helper to update grid data and resize columns
  private updateGrid(grid: any, data: any) {
    grid.api.applyTransaction({ data });
    this.igridService.resizeGridColumns(grid.api);
  }


  onDelete(data: any) {
    this.iproductService.deleteProduct(data.p_id).subscribe(
      (result: DbResult) => {
        if (result.message === "Success") {
          this.products = this.products.filter(p => p.p_id !== data.p_id);
          this.snackBarService.showSuccess("Successfully Removed");

        } else {
          alert(result.message);
        }
      },
      (error: any) => {
        console.error('Error deleting income', error);
      }
    );
  }

  onDetail(data: any) {

  }


  getProducts() {
    this.iproductService.getProducts().subscribe(
      (data: Product[]) => {
        this.products = data;
        this.igridService.resizeGridColumns(this.productsGrid.api);
      },
      (error: any) => {
      }
    );
  }
  onGridReady(event: GridReadyEvent) {
    this.igridService.resizeGridColumns(this.productsGrid.api);
    this.igridService.resizeGridColumns(this.barcodeGrid.api);
    this.igridService.resizeGridColumns(this.prodSizeGrid.api);
  }

  openCreateFormModal(): void {
    this.clear();
    $('#productFormModal').modal('show');
    $('#myTab a[href="#details"]').tab('show');
  }

  onCategoryChange(c_id: any) { this.product.p_category = c_id; }
  onSubCategoryChange(sc_id: any) { this.product.p_sub_category = sc_id; }
  onDivisionChange(d_id: any) { this.product.p_division = d_id; }
  onSubDivisionChange(sd_id: any) { this.product.p_sub_division = sd_id; }
  onProdSizeChange(ps_id: number) {
    const selectedSize = this.sizes.find(size => size.md_id == ps_id);
    if (selectedSize) {
      this.prodSize.ps_size = selectedSize.md_id;
      this.prodSize.ps_size_name = selectedSize.md_name;
    }

  }
  onProdColorChange(pc_id: number) {

    const selectedColor = this.colors.find(c => c.md_id == pc_id);

    if (selectedColor) {
      this.prodColor.pc_color = selectedColor.md_id;
      this.prodColor.pc_color_name = selectedColor.md_name;
    }

    this.selectedColor = pc_id;
    this.refreshAttachmentGallery();
  }

  createOrUpdateProduct() {
    const formData = new FormData();
    this.product.p_cre_by = this.currentUser.u_id;
    this.product.p_barcodes = JSON.stringify(this.barcodes.map(b => ({ b_bar_code: b.b_bar_code })));
    this.product.p_sizes = JSON.stringify(this.prodSizes.map(b => ({ ps_size: b.ps_size })));
    this.product.p_colors = JSON.stringify(this.prodColors.map(b => ({ pc_color: b.pc_color })));
    this.product.p_attachements = JSON.stringify(this.prodAttachements.map(b => ({ pa_image_path: b.pa_image_path })));
    formData.append("product", JSON.stringify(this.product));
    this.selectedFiles.forEach(file => {
      formData.append('images', file, file.name); // 'images' should match the expected field name in the backend
    });
    this.iproductService.createOrUpdateProduct(formData).subscribe(
      (data: DbResult) => {
        this.dbResult = data;
        if (data.message === "Success") {
          this.clear();
          $('#productFormModal').modal('hide');

          this.iproductService.refreshProducts();
          this.snackBarService.showSuccess("Successfully Saved");
        } else {
          this.snackBarService.showError(data.message);
        }
      },
      (error: any) => {
        this.snackBarService.showError("Error occurred while saving the product.");
      }
    );
  }
  clear() {

    this.product = new Product();
    this.barcodes = [];
    this.prodSizes = [];
    this.prodColors = [];
    this.prodAttachements = [];
    this.imagePreviews = [];
    this.selectedFiles = [];
    $("#newSize").val(0).trigger('change');
    $("#newColor").val(0).trigger('change');
  }

  setSelect2Values() {
    $("#p_category").val(this.product.p_category).trigger('change');
    $("#p_sub_category").val(this.product.p_sub_category).trigger('change');
    $("#p_division").val(this.product.p_division).trigger('change');
    $("#p_sub_division").val(this.product.p_sub_division).trigger('change');

  }
  addBarcode() {
    if (this.newBarcode != "") {
      const isDuplicate = this.barcodes.some(barcode => barcode.b_bar_code === this.newBarcode);
      if (isDuplicate) {
        this.snackBarService.showError("This barcode is already added.");
        return;
      }
      this.barcode = new Barcode();
      this.barcode.b_id = this.barcodes.length + 1;
      this.barcode.b_bar_code = this.newBarcode;
      this.barcodes.push(this.barcode);
      this.barcodeGrid.api.applyTransaction({ add: [this.barcode] });
      this.igridService.resizeGridColumns(this.barcodeGrid.api);
      this.snackBarService.showSuccess("Successfully Added");
      this.newBarcode = '';
      this.barcodeInput.nativeElement.focus();

    } else {
      this.snackBarService.showError("Please Select Barcode");
    }
  }

  onDeleteBarcode(data: any) {

    this.barcodes = this.barcodes.filter(barcode => barcode.b_id !== data.b_id);
    this.barcodeGrid.api.applyTransaction({ remove: [{ b_id: data.b_id }] });
    this.snackBarService.showSuccess("Barcode successfully Removed");
  }

  addProdSize() {
    if (this.prodSize.ps_size != 0) {
      const isDuplicate = this.prodSizes.some(size => size.ps_size === this.prodSize.ps_size);
      if (isDuplicate) {
        this.snackBarService.showError("This size is already added.");
        return;
      }
      this.prodSize.ps_id = this.prodSizes.length + 1;
      this.prodSizes.push(this.prodSize);
      this.prodSizeGrid.api.applyTransaction({ add: [this.prodSize] });
      this.igridService.resizeGridColumns(this.prodSizeGrid.api);
      this.snackBarService.showSuccess("Successfully Added");
      this.prodSize = new ProdSize();
    } else {
      this.snackBarService.showError("Please Select A Size");
    }
  }


  onDeleteProdSize(data: any) {
    this.prodSizes = this.prodSizes.filter(prodSize => prodSize.ps_id !== data.ps_id);
    this.prodSizeGrid.api.applyTransaction({ remove: [{ ps_id: data.ps_id }] });
    this.snackBarService.showSuccess("Size successfully removed");
  }

  addProdColor() {
    if (this.prodColor.pc_color != 0) {
      const isDuplicate = this.prodColors.some(prodColor => prodColor.pc_color === this.prodColor.pc_color);
      if (isDuplicate) {
        this.snackBarService.showError("This Color is already added.");
        return;
      }
      this.prodColor.pc_id = this.prodColors.length + 1;
      this.prodColors.push(this.prodColor);
      this.prodColorGrid.api.applyTransaction({ add: [this.prodColor] });
      this.igridService.resizeGridColumns(this.prodColorGrid.api);
      this.snackBarService.showSuccess("Successfully Added");
      this.prodColor = new ProdColor();
    } else {
      this.snackBarService.showError("Please Select A Color");
    }
  }


  onDeleteProdColor(data: any) {

    this.prodColors = this.prodColors.filter(prodColor => prodColor.pc_color !== data.pc_color);
    this.prodColorGrid.api.applyTransaction({ remove: [{ pc_color: data.pc_color }] });
    this.snackBarService.showSuccess("Color successfully removed");
  }



  uploadImages() {

  }
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    files.forEach(file => {
      // Create a colored file wrapper for tracking
      (file as any).targetColor = this.selectedColor;
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;
        this.imageItems.push({
          file: file,
          preview: result,
          type: 'new',
          color: this.selectedColor // Tag preview with color
        });
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number): void {
    const item = this.imageItems[index];
    if (item.type === 'existing') {
      if (confirm("Are you sure you want to permanently delete this image from the server?")) {
        this.iproductService.deleteProductAttachement(item.id).subscribe((res: any) => {
          this.imageItems.splice(index, 1);
          this.snackBarService.showSuccess("Image deleted successfully");
        });
      }
    } else {
      // For local removals, find and remove from selectedFiles buffer too
      const fileIndex = this.selectedFiles.indexOf(item.file);
      if (fileIndex > -1) this.selectedFiles.splice(fileIndex, 1);
      this.imageItems.splice(index, 1);
    }
  }


  uploadProdAttachements() {
    if (this.selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append('product', this.product.p_id.toString());
      formData.append('color', this.selectedColor.toString());
      formData.append('user', this.currentUser.u_id.toString());
      
      // ONLY upload files that were intended for the CURRENT selected color
      const filesToUpload = this.selectedFiles.filter((f: any) => f.targetColor === this.selectedColor);
      
      if (filesToUpload.length === 0) {
          this.snackBarService.showError("No new images to upload for this color variation.");
          return;
      }

      filesToUpload.forEach(file => {
        formData.append('images', file, file.name);
      });
      this.iproductService.uploadProdAttachements(formData).subscribe(
        (data: DbResult) => {
          if (data.message === "Success") {
            this.snackBarService.showSuccess("Assets synchronized successfully");
            this.selectedFiles = []; // Clear the upload buffer
            // Remove 'new' items from preview since they are now uploaded
            this.imageItems = this.imageItems.filter(x => x.type !== 'new');
            this.refreshAttachmentGallery(); // Fetch the official synced versions from server
          }
          else {
            this.snackBarService.showError("Failed to upload attachments.");
          }
        }
      );
    }
  }
}

