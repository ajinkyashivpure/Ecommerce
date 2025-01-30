import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {Router, RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body">
              <h2 class="text-center mb-4">Login</h2>
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input
                    [(ngModel)]="credentials.email"
                    name="email"
                    type="email"
                    class="form-control"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input
                    [(ngModel)]="credentials.password"
                    name="password"
                    type="password"
                    class="form-control"
                    required
                  >
                </div>
                <div *ngIf="errorMessage" class="alert alert-danger">
                  {{errorMessage}}
                </div>
                <button type="submit" class="btn btn-primary w-100">Login</button>
              </form>
              <div class="text-center mt-3">
                <p>Don't have an account?
                  <a [routerLink]="['/register']" class="text-primary" style="cursor: pointer; text-decoration: underline;">Register here</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: (response) => {
        this.authService.setCurrentUser(response.user, response.token);
        if (response.user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.errorMessage = 'Invalid email or password';
      }
    });
  }
}
