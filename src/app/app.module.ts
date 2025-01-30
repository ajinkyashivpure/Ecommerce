import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CartComponent } from './components/cart/cart.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'cart', component: CartComponent },
  { path: '', redirectTo: '/products', pathMatch: 'full' }
];

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
      { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
      { path: 'products', loadComponent: () => import('./components/product-list/product-list.component').then(m => m.ProductListComponent) },
      { path: 'cart', loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent) },
      { path: '', redirectTo: '/products', pathMatch: 'full' }
    ])
  ],
  providers: [
    provideHttpClient(
      withInterceptors([AuthInterceptor])
    )
  ]
})
export class AppModule { }
