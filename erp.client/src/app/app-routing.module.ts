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
import { CustomerComponent } from './pages/customer/customer.component';
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
import { FeedbackComponent } from './pages/feedback/feedback.component';
import { ProductReviewsComponent } from './pages/product.reviews/product.reviews.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { PriceChangeComponent } from './pages/price.change/price.change.component';

import { CustomerLoginComponent } from './pages/website/customer-login/customer-login.component';
import { MycartComponent } from './pages/website/mycart/mycart.component';
import { UserRegistrationComponent } from './pages/website/user-registration/user-registration.component';
import { FavouriteComponent } from './pages/website/favourite/favourite.component';
import { BlogComponent } from './pages/website/blog/blog.component';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { CustomerOrderComponent } from './pages/customer.order/customer.order.component';
import { MyOrdersComponent } from './pages/website/my.orders/my.orders.component';




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
        path: 'blogs', component: BlogsComponent
      },
      { path: 'blog/:id', component: BlogComponent },
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

      }
    ]
  },
  {
    path: 'user-registration',
    component: UserRegistrationComponent
  },
  {
    path: 'customer-login',
    component: CustomerLoginComponent
  },
  // Define your login route
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
        path: 'menus',
        component: MenuComponent
      },
      {
        path: 'menuallocation',
        component: MenuAllocationComponent
      },
      {
        path: 'customers',
        component: CustomerComponent
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

      }
    ]
  }
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled'
    })
  ],
  exports: [RouterModule],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ]
})
export class AppRoutingModule { }

