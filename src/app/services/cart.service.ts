import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, catchError, EMPTY, Observable, switchMap, throwError} from 'rxjs';
import { CartItem } from '../models/cart-item';
import {tap} from 'rxjs/operators';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/test/cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();


  constructor(private http: HttpClient,private authService : AuthService) {}


  deleteCartItem(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${cartItemId}`);
  }

  addToCart(cartItem: any): Observable<any> {
    console.log('Attempting to add to cart:', cartItem);
    return this.http.post<any>(`${this.apiUrl}/addToCart`, cartItem).pipe(
      tap(response => console.log('Server response:', response)),
      catchError(error => {
        console.error('Server error:', error);
        return throwError(() => error);
      })
    );
  }

  refreshCartItems(userId: number): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/${userId}`).pipe(
      tap(items => {
        console.log('Refreshed cart items:', items); // Debug log
        this.cartItemsSubject.next(items);
      })
    );
  }

  getCartItems(userId: number): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}/${userId}`).pipe(
      tap(items => {
        console.log('Fetched cart items:', items);
        this.cartItemsSubject.next(items);
      })
    );
  }

  updateCartItemQuantity(cartItemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateQuantity/${cartItemId}?quantity=${quantity}`, {}).pipe(
      tap(() => {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser?.id) {
          this.refreshCartItems(currentUser.id).subscribe();
        }
      })
    );
  }

}
