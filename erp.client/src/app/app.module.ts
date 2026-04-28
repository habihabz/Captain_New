import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { JwtModule, JwtModuleOptions } from '@auth0/angular-jwt'; // Ensure correct import
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SidebarComponent } from './pages/layout/sidebar/sidebar.component';
import { TopnavComponent } from './pages/layout/topnav/topnav.component';
import { FooterComponent } from './pages/layout/footer/footer.component';
import { HeaderComponent } from './pages/layout/header/header.component';
import { UsersComponent } from './pages/users/users.component';
import { RoleComponent } from './pages/role/role.component';// Adjust import path as necessary
import { AuthInterceptor } from './services/auth.interceptor';
import { LoadingInterceptor } from './services/loading.interceptor';
import { environment } from '../environments/environment';
import { MenuComponent } from './pages/menu/menu.component';
import { MenuAllocationComponent } from './pages/menu.allocation/menu.allocation.component';
import { Select2Directive } from './directives/select2.directive';
import { DateRangeDirective } from './directives/daterange.directive';
import { DataTablesModule} from 'angular-datatables';
import { CustomerComponent } from './pages/customer/customer.component';
import { SupplierComponent } from './pages/supplier/supplier.component';
import { CategoryComponent } from './pages/category/category.component';
import { IncomeComponent } from './pages/income/income.component'
import { MasterDataComponent } from './pages/master-data/master-data.component';
import { AgGridModule } from 'ag-grid-angular'; 
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsComponent } from './pages/products/products.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { WebsiteModule } from './pages/website/website.module';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { ProductReviewsComponent } from './pages/product.reviews/product.reviews.component';
import { PriceChangeComponent } from './pages/price.change/price.change.component';
import { BlogComponent } from './pages/blog/blog.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { CustomerOrderComponent } from './pages/customer.order/customer.order.component';
import { SliderComponent } from './pages/slider/slider.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { ConstantValuesComponent } from './pages/constant.values/constant.values.component';
import { OrderReportComponent } from './pages/admin/order.report/order.report.component';
import { ReturnedOrdersComponent } from './pages/returned.orders/returned-orders.component';
import { StatusComponent } from './pages/status/status.component';
import { ActionRendererComponent } from './directives/action.renderer';
import { PromocodeComponent } from './pages/promocode/promocode.component';
import { RefundManagementComponent } from './pages/admin/refund-management/refund-management.component';


// Define a function to get the token
export function tokenGetter() {
  return localStorage.getItem('token');
}

// Define the JWT configuration statically
const jwtConfig: JwtModuleOptions = {
  config: {
    tokenGetter: tokenGetter,
    allowedDomains: [environment.serverHostAddress.replace(/^https?:\/\//, '')],
    disallowedRoutes: [`${environment.serverHostAddress}/auth/`],
  }
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    LayoutComponent,
    DashboardComponent,
    SidebarComponent,
    TopnavComponent,
    FooterComponent,
    HeaderComponent,
    UsersComponent,
    RoleComponent,
    MenuComponent,
    MenuAllocationComponent,
    Select2Directive,
    DateRangeDirective,
    CustomerComponent,
    SupplierComponent,
    CategoryComponent,
    IncomeComponent,
    MasterDataComponent,
    ProductsComponent,
    FeedbackComponent,
    ProductReviewsComponent,
    PriceChangeComponent,
    BlogComponent,
    AccessDeniedComponent,
    CustomerOrderComponent,
    SliderComponent,
    ConstantValuesComponent,
    OrderReportComponent,
    ReturnedOrdersComponent,
    StatusComponent,
    ActionRendererComponent,
    PromocodeComponent,
    RefundManagementComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule ,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    JwtModule.forRoot(jwtConfig), 
    DataTablesModule,
    AgGridModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    CKEditorModule,
    WebsiteModule,
    MatSidenavModule,
    MatTabsModule,
    MatTableModule,
    MatCardModule,
    MatChipsModule,
    MatListModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
