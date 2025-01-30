import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import {NgForOf, NgIf} from '@angular/common';
import {CartItem} from '../../models/cart-item';

@Component({
  selector: 'app-cart',
  imports: [
    NgForOf
  ],
  template: `
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
                    <div class="d-flex align-items-center gap-3">
                      <div class="btn-group">
                        <button class="btn btn-outline-primary btn-sm"
                                (click)="decrementQuantity(item)"
                                [disabled]="item.quantity <= 1">
                          <i class="fas fa-minus"></i>
                        </button>
                        <span class="btn btn-outline-primary btn-sm disabled">
                          {{item.quantity}}
                        </span>
                        <button class="btn btn-outline-primary btn-sm"
                                (click)="incrementQuantity(item)">
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <button (click)="removeFromCart(item.id!)" class="btn btn-danger">
                    <i class="fas fa-trash me-2"></i>Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" [disabled]="!cartItems.length">
              <i class="fas fa-credit-card me-2"></i>Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
    <div *ngIf="showCart" class="modal-backdrop show"></div>
  `
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  showCart: any;

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.cartService.getCartItems(currentUser.id!).subscribe({
        next: (items) => {
          this.cartItems = items;
        },
        error: (error) => {
          console.error('Error loading cart items:', error);
        }
      });
    }
  }

  incrementQuantity(item: CartItem): void {
    this.cartService.updateCartItemQuantity(item.id!, item.quantity + 1).subscribe();
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateCartItemQuantity(item.id!, item.quantity - 1).subscribe();
    }
  }

  removeFromCart(cartItemId: number): void {
    console.log('Attempting to remove item:', cartItemId); // Debug log
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.cartService.deleteCartItem(cartItemId).subscribe({
        next: () => {
          console.log('Item removed successfully');
          this.cartService.refreshCartItems(Number(currentUser.id)).subscribe();
          alert('Item removed from cart');
        },
        error: (error) => {
          console.error('Error removing item:', error);
          alert('Failed to remove item from cart');
        }
      });
    }
  }
}
