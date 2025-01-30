// src/app/services/auth.service.ts
import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import { User } from '../models/user';
import {catchError, tap} from 'rxjs/operators';
import { LoginResponse } from '../models/login-response';
import {isPlatformBrowser} from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/test/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  private refreshTokenTimeout: any;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let storedUser = null;
    try {
      if (isPlatformBrowser(this.platformId)) {
        const storedUserStr = localStorage.getItem('currentUser');
        if (storedUserStr) {
          storedUser = JSON.parse(storedUserStr);
        }
      }
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem('currentUser'); // Clear invalid data
    }
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
  }

  register(user: User): Observable<any> {
    console.log('Sending registration request:', user); // Debug log
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Login response:', response); // Debug log
          this.setCurrentUser(response.user, response.token);
          this.startRefreshTokenTimer();
        })
      );
  }

  logout() {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    this.stopRefreshTokenTimer();
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
  refreshToken() {
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh-token`, {}).pipe(
      tap(response => {
        console.log('Refresh token response:', response); // Debug log
        if (response.token) {
          // Clear old token first
          localStorage.removeItem('token');
          // Set new token
          localStorage.setItem('token', response.token);
          if (response.user) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
        }
      })
    );
  }
  private startRefreshTokenTimer() {
    // Parse token to get expiry time
    const token = localStorage.getItem('token');
    if (token) {
      const jwtToken = JSON.parse(atob(token.split('.')[1]));
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000); // Refresh 1 minute before expiry
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    }
  }

  private stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User, token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
    this.currentUserSubject.next(user);
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }
}
