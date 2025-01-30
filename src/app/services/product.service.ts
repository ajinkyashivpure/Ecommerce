import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable, throwError} from 'rxjs';
import { Product } from '../models/product';
import {tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/test/products';

  constructor(private http: HttpClient) {}

  createProduct(formData: FormData): Observable<any> {
    console.log('Sending product with image:', formData.get('image'));
    return this.http.post(`${this.apiUrl}/create`, formData).pipe(
      tap(response => {
        console.log('Product created:', response);
      }),
      catchError(error => {
        console.error('Error creating product:', error);
        return throwError(() => new Error('Failed to create product: ' + error.message));
      })
    );
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/see`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/seeById/${id}`);
  }

  getProductImage(productId: number): string {
    try {
      if (!productId) {
        return 'assets/placeholder.jpg';
      }
      return `${this.apiUrl}/image/${productId}?t=${new Date().getTime()}`;
    } catch (error) {
      console.error('Error getting product image:', error);
      return 'assets/placeholder.jpg';
    }
  }
}
