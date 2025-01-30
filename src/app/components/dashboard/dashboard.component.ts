// dashboard.component.ts
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {Product} from '../../models/product';
import {CartItem} from '../../models/cart-item';
import {ProductService} from '../../services/product.service';
import {CartService} from '../../services/cart.service';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <nav class="navbar navbar-expand-lg shadow-sm" style="background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);">
        <div class="container">
          <a class="navbar-brand text-white fw-bold">
            <i class="fas fa-dumbbell me-2"></i>FitnessFusion
          </a>
          <div class="d-flex align-items-center">
            <div class="input-group me-3">
              <input [(ngModel)]="searchId" type="number" class="form-control" placeholder="Search by ID">
              <button (click)="searchProduct()" class="btn btn-light">
                <i class="fas fa-search"></i>
              </button>
            </div>
            <button (click)="viewCart()" class="btn btn-light me-2">
              <i class="fas fa-shopping-cart"></i> Cart
              <span class="badge bg-danger ms-1">{{cartItemCount}}</span>
            </button>
            <button (click)="logout()" class="btn btn-danger">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </nav>

      <div class="container mt-4">
        <!-- Search Results -->
        <div *ngIf="searchResult" class="row mb-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h5 class="text-primary mb-3">Search Result</h5>
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="mb-2">{{searchResult.name}}</h6>
                    <p class="text-muted mb-2">{{searchResult.description}}</p>
                    <p class="h5 text-primary mb-0">₹{{searchResult.price}}</p>
                  </div>
                  <button (click)="addToCart(searchResult)"
                          class="btn btn-success"
                          [disabled]="searchResult.stock === 0">
                    <i class="fas fa-cart-plus me-2"></i>Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="row g-4">
          <div *ngFor="let product of products" class="col-md-4">
            <div class="card h-100 shadow-sm hover-card">
              <div class="card-img-wrapper">
                <img [src]="productService.getProductImage(product.id!)"
                     class="card-img-top"
                     alt="Product image"
                     style="height: 250px; object-fit: cover;"
                     (error)="handleImageError($event)">
              </div>
              <div class="card-body">
                <h5 class="card-title text-primary fw-bold">{{product.name}}</h5>
                <p class="card-text text-muted">{{product.description}}</p>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <span class="h4 mb-0">₹{{product.price}}</span>
                  <span class="badge bg-success">Stock: {{product.stock}}</span>
                </div>
                <div class="d-flex gap-2">
                  <input type="number"
                         [(ngModel)]="product.quantity"
                         class="form-control w-25"
                         min="1"
                         [max]="product.stock">
                  <button (click)="addToCart(product)"
                          class="btn btn-primary flex-grow-1"
                          [disabled]="product.stock === 0">
                    <i class="fas fa-cart-plus me-2"></i>Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Modal -->
      <div class="modal" [class.show]="showCart" [style.display]="showCart ? 'block' : 'none'">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title">
                <i class="fas fa-shopping-cart me-2"></i>Shopping Cart
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="showCart = false"></button>
            </div>
            <div class="modal-body">
              <div *ngIf="cartItems.length === 0" class="text-center py-5">
                <i class="fas fa-shopping-basket fa-3x text-muted mb-3"></i>
                <p class="lead text-muted">Your cart is empty</p>
              </div>
              <div *ngFor="let item of cartItems" class="card mb-3 shadow-sm">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 class="mb-1">{{item.productName}}</h6>
                      <p class="text-muted mb-0">Quantity: {{item.quantity}}</p>
                    </div>
                    <button (click)="removeFromCart(item.id!)" class="btn btn-danger">
                      <i class="fas fa-trash me-2"></i>Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" (click)="showCart = false">
                Continue Shopping
              </button>
              <button class="btn btn-primary" [disabled]="!cartItems.length">
                <i class="fas fa-credit-card me-2"></i>Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="showCart" class="modal-backdrop show"></div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  products:(Product & {quantity?:number})[] = [];
  cartItems: CartItem[] = [];
  searchId: number | null = null;
  searchResult: Product | null = null;
  showCart = false;
  cartItemCount = 0;

  constructor(
    protected productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.initializeCart();
  }

  private initializeCart(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.cartService.cartItems$.subscribe(items => {
        this.cartItems = items;
        this.cartItemCount = items.length;
      });

      this.cartService.refreshCartItems(currentUser.id).subscribe();
    }
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => this.products = products,
      error: (error) => console.error('Error loading products:', error)
    });
  }

  loadCartItems(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.cartService.getCartItems(currentUser.id!).subscribe({
        next: (items) => {
          this.cartItems = items;
          this.cartItemCount = items.length;
        },
        error: (error) => console.error('Error loading cart:', error)
      });
    }
  }

  searchProduct(): void {
    if (this.searchId) {
      this.productService.getProductById(this.searchId).subscribe({
        next: (product) => this.searchResult = product,
        error: () => {
          alert('Product not found');
          this.searchResult = null;
        }
      });
    }
  }

  addToCart(product: Product & { quantity?: number }): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      const cartItem = {
        userId: currentUser.id,
        productId: product.id,
        quantity: product.quantity || 1
      };

      console.log('Sending to backend:', cartItem); // Debug log

      this.cartService.addToCart(cartItem).subscribe({
        next: (response) => {
          console.log('Response:', response); // Debug log
          alert('Added to cart successfully');
          // Refresh cart items
          this.cartService.refreshCartItems(Number(currentUser.id)).subscribe();
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Failed to add item to cart: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  removeFromCart(cartItemId: number): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      this.cartService.deleteCartItem(cartItemId).subscribe({
        next: () => {
          // Refresh cart items after deletion
          this.cartService.refreshCartItems(Number(currentUser.id)).subscribe();
          alert('Item removed from cart');
        },
        error: (error) => {
          console.error('Error removing from cart:', error);
          alert('Failed to remove item from cart');
        }
      });
    }
  }

  viewCart(): void {
    this.showCart = true;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  handleImageError(event: any) {
    // Set a default image when the product image fails to load
    event.target.src = 'assets/placeholder.jpg';
  }
}
