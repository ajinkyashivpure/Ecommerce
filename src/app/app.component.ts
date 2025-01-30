import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import {Router, RouterLink, RouterModule, RouterOutlet} from '@angular/router';
import {CommonModule} from '@angular/common';
import {CartService} from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    CommonModule
  ],
  template:`
    <nav class="navbar navbar-expand-lg shadow-sm" style="background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);">
      <div class="container">
        <a class="navbar-brand text-white fw-bold" routerLink="/">
          <i class="fas fa-dumbbell me-2"></i>
          FitnessFusion
        </a>
        <div class="d-flex">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link text-white" routerLink="/products">Products</a>
            </li>
            <li class="nav-item" *ngIf= "isLoggedIn" >
              <a class="nav-link text-white" (click)= " viewCart() "  style="cursor: pointer;">
                <i class="fas fa-shopping-cart"></i>
                <span class="badge bg-danger ms-1">{{cartItemCount}}</span>
              </a>
            </li>
          </ul>
          <ul class="navbar-nav">
            <ng-container *ngIf="!isLoggedIn">
              <li class="nav-item">
                <a class="nav-link text-white" routerLink="/login">Login</a>
              </li>
              <li class="nav-item">
                <a class="btn btn-light" routerLink="/register">Register</a>
              </li>
            </ng-container>
            <li class="nav-item" *ngIf="isLoggedIn">
              <button class="btn btn-outline-light" (click)="logout()">Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  cartItemCount: number = 0;
  showCart = false;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    // Subscribe to cart updates
    if (this.authService.getCurrentUser()) {
      this.cartService.cartItems$.subscribe(items => {
        this.cartItemCount = items.length;
      });
    }
  }

  get isLoggedIn(): boolean {
    return !!this.authService.getCurrentUser();
  }

  viewCart(): void {
    this.showCart = true;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

}

