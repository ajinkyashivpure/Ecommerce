import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ProductService} from '../../services/product.service';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {Product} from '../../models/product';

// admin-dashboard.component.ts
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div class="container">
          <a class="navbar-brand">Admin Dashboard</a>
          <button (click)="logout()" class="btn btn-danger">Logout</button>
        </div>
      </nav>

      <div class="container">
        <div class="card mb-4">
          <div class="card-body">
            <h5 class="card-title">Add New Product</h5>
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
              <div class="mb-3">
                <label class="form-label">Image</label>
                <input type="file" class="form-control" (change)="onFileSelect($event)" accept="image/*">
              </div>
              <button type="submit" class="btn btn-primary">Add Product</button>
            </form>
          </div>
        </div>

        <h5>Available Products</h5>
        <div class="row">
          <div *ngFor="let product of products" class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{product.name}}</h5>
                <p class="card-text">{{product.description}}</p>
                <p class="card-text">
                  <strong>Price: </strong>{{product.price}}
                  <br>
                  <strong>Stock: </strong>{{product.stock}}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  products: Product[] = [];
  newProduct: Product = {
    name: '',
    description: '',
    price: 0,
    stock: 0
  };
  selectedFile: File | null = null;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => this.products = products,
      error: (error) => console.error('Error loading products:', error)
    });
  }

  //previous one is on whatsapp
  addProduct(): void {
    const formData = new FormData();
    formData.append('name', this.newProduct.name);
    formData.append('description', this.newProduct.description);
    formData.append('price', this.newProduct.price.toString());
    formData.append('stock', this.newProduct.stock.toString());

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.productService.createProduct(formData).subscribe({
      next: () => {
        alert('Product added successfully');
        this.loadProducts();
        this.resetForm();
      },
      error: (error) => {
        console.error('Error adding product:', error);
        alert('Failed to add product');
      }
    });
  }

  resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      stock: 0
    };
    this.selectedFile = null;
  }


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getProductImage(productId?: number): string {
    if (productId) {
      return this.productService.getProductImage(productId);
    }
    return 'assets/placeholder-image.jpg'; // Add a placeholder image path
  }
}
