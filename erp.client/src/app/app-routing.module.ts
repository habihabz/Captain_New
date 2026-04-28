import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from './auth.guard';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { RoleComponent } from './pages/role/role.component';
import { MenuComponent } from './pages/menu/menu.component';
import { MenuAllocationComponent } from './pages/menu.allocation/menu.allocation.component';
import { SupplierComponent } from './pages/supplier/supplier.component';
import { CategoryComponent } from './pages/category/category.component';
import { IncomeComponent } from './pages/income/income.component';
import { MasterDataComponent } from './pages/master-data/master-data.component';
import { ProductsComponent } from './pages/products/products.component';
import { SitelayoutComponent } from './pages/website/sitelayout/sitelayout.component';
import { WebHomeComponent } from './pages/website/web.home/web.home.component';
import { SingleProductComponent } from './pages/website/single-product/single-product.component';
import { ContactUsComponent } from './pages/website/contact.us/contact.us.component';
import { BlogsComponent } from './pages/website/blogs/blogs.component';
import { ShopComponent } from './pages/website/shop/shop.component';
import { SitemapComponent } from './pages/website/sitemap/sitemap.component';
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { ProductReviewsComponent } from './pages/product.reviews/product.reviews.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { PriceChangeComponent } from './pages/price.change/price.change.component';
import { MycartComponent } from './pages/website/mycart/mycart.component';
import { UserRegistrationComponent } from './pages/website/user-registration/user-registration.component';
import { FavouriteComponent } from './pages/website/favourite/favourite.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { CustomerOrderComponent } from './pages/customer.order/customer.order.component';
import { MyOrdersComponent } from './pages/website/my.orders/my.orders.component';
import { SliderComponent } from './pages/slider/slider.component';
import { AboutUsComponent } from './pages/website/about.us/about.us.component';
import { BlogComponent } from './pages/blog/blog.component';
import { OrderDetailsComponent } from './pages/website/order.details/order.details.component';
import { ConstantValuesComponent } from './pages/constant.values/constant.values.component';
import { OrderReportComponent } from './pages/admin/order.report/order.report.component';
import { ReturnedOrdersComponent } from './pages/returned.orders/returned-orders.component';
import { StatusComponent } from './pages/status/status.component';
import { PromocodeComponent } from './pages/promocode/promocode.component';
import { RefundManagementComponent } from './pages/admin/refund-management/refund-management.component';
import { PaymentSuccessComponent } from './pages/website/payment.success/payment.success.component';
import { PaymentFailureComponent } from './pages/website/payment.failure/payment.failure.component';




const routes: Routes = [
  // Redirect empty path to login
  { path: '', redirectTo: 'web-home', pathMatch: 'full' },
  {
    path: '',
    component: SitelayoutComponent,
    children: [
      {
        path: 'web-home',
        component: WebHomeComponent
      },
      { path: 'single-product/:id', component: SingleProductComponent },
      {
        path: 'contact-us', component: ContactUsComponent
      },
      {
        path: 'sitemap', component: SitemapComponent
      },
      {
        path: 'about-us', component: AboutUsComponent
      },
      {
        path: 'blog', component: BlogsComponent
      },
      {
        path: 'blog/:id', component: BlogsComponent
      },
      {
        path: 'shop', component: ShopComponent
      },
      {
        path: 'my-cart',
        component: MycartComponent
      },
      {
        path: 'favourites',
        component: FavouriteComponent

      },
      {
        path: 'myorders',
        component: MyOrdersComponent

      },
      { path: 'order-details/:id', component: OrderDetailsComponent },
      { path: 'payment-success', component: PaymentSuccessComponent },
      { path: 'payment-failure', component: PaymentFailureComponent },
    ]
  },
  {
    path: 'user-registration',
    component: UserRegistrationComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  { path: 'logout', component: LoginComponent },

  {
    path: 'access-denied',
    component: AccessDeniedComponent
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'users',
        component: UsersComponent
      },
      {
        path: 'roles',
        component: RoleComponent
      },
      {
        path: 'blogs',
        component: BlogComponent
      },
      {
        path: 'menus',
        component: MenuComponent
      },
      {
        path: 'menuallocation',
        component: MenuAllocationComponent
      },
      {
        path: 'suppliers',
        component: SupplierComponent
      },
      {
        path: 'categories',
        component: CategoryComponent
      },
      {
        path: 'incomes',
        component: IncomeComponent
      },
      {
        path: 'master-data',
        component: MasterDataComponent
      },
      {
        path: 'products',
        component: ProductsComponent
      },
      {
        path: 'feedbacks',
        component: FeedbackComponent
      },
      {
        path: 'product-reviews',
        component: ProductReviewsComponent

      },
      {
        path: 'price-change',
        component: PriceChangeComponent

      },
      {
        path: 'customer-order',
        component: CustomerOrderComponent

      },
      {
        path: 'sliders',
        component: SliderComponent

      },
      {
        path: 'constant-values',
        component: ConstantValuesComponent

      },
      {
        path: 'returned-orders',
        component: ReturnedOrdersComponent
      },
      {
        path: 'status',
        component: StatusComponent
      },
      {
        path: 'promocodes',
        component: PromocodeComponent
      },
      {
        path: 'refund-management',
        component: RefundManagementComponent
      },
      {
        path: 'refund-management',
        component: RefundManagementComponent
      },
      {
        path: 'order-report',
        component: OrderReportComponent
      }

    ]
  }
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled'
    })
  ],
  exports: [RouterModule],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ]
})
export class AppRoutingModule { }

