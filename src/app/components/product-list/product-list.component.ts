import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {CartItem} from '../../models/cart-item';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports :[CommonModule,FormsModule],
  template: `
    <div class="container mt-5">
      <h2>Products</h2>
      <div *ngIf="isAdmin" class="mb-3">
        <button class="btn btn-primary" (click)="showAddProductForm = !showAddProductForm">
          Add New Product
        </button>
      </div>

      <div *ngIf="showAddProductForm && isAdmin" class="mb-4">
        <h3>Add New Product</h3>
        <form (ngSubmit)="addProduct()">
          <div class="mb-3">
            <input [(ngModel)]="newProduct.name" name="name" type="text" class="form-control" placeholder="Product Name" required>
          </div>
          <div class="mb-3">
            <textarea [(ngModel)]="newProduct.description" name="description" class="form-control" placeholder="Description" required></textarea>
          </div>
          <div class="mb-3">
            <input [(ngModel)]="newProduct.price" name="price" type="number" class="form-control" placeholder="Price" required>
          </div>
          <div class="mb-3">
            <input [(ngModel)]="newProduct.stock" name="stock" type="number" class="form-control" placeholder="Stock" required>
          </div>
          <button type="submit" class="btn btn-success">Add Product</button>
        </form>
      </div>

      <div class="row">
        <div *ngFor="let product of products" class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">{{product.name}}</h5>
              <p class="card-text">{{product.description}}</p>
              <p class="card-text">Price: {{product.price}}</p>
              <p class="card-text">Stock: {{product.stock}}</p>
              <div *ngIf="!isAdmin">
                <input type="number" [(ngModel)]="product.quantity" class="form-control mb-2" placeholder="Quantity">
                <button (click)="addToCart(product)" class="btn btn-primary">Add to Cart</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products:(Product & {quantity?:number})[] = [];
  newProduct: Product = {
    name: '',
    description: '',
    price: 0,
    stock: 0
  };
  showAddProductForm = false;
  isAdmin = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'ADMIN';
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  addProduct(): void {
    this.productService.createProduct(this.newProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.showAddProductForm = false;
        this.newProduct = {
          name: '',
          description: '',
          price: 0,
          stock: 0
        };
      },
      error: (error) => {
        console.error('Error adding product:', error);
      }
    });
  }

  addToCart(product: any): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const cartItem:CartItem = {
        productId: product.id,
        userId: currentUser.id!,
        quantity: product.quantity || 1,
        productName:product.name
      };
      this.cartService.addToCart(cartItem).subscribe({
        next: () => {
          alert('Product added to cart');
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
        }
      });
    }
  }
}
