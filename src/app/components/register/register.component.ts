import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import {Router, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="row justify-content-center mt-5">
        <div class="col-md-6">
          <div class="card shadow">
            <div class="card-body">
              <h2 class="text-center mb-4">Register</h2>
              <form (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Name</label>
                  <input
                    [(ngModel)]="user.name"
                    name="name"
                    type="text"
                    class="form-control"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input
                    [(ngModel)]="user.email"
                    name="email"
                    type="email"
                    class="form-control"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input
                    [(ngModel)]="user.password"
                    name="password"
                    type="password"
                    class="form-control"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label class="form-label">Confirm Password</label>
                  <input
                    [(ngModel)]="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    class="form-control"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label class="form-label">Role</label>
                  <select [(ngModel)]="user.role" name="role" class="form-select">
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div *ngIf="errorMessage" class="alert alert-danger">
                  {{errorMessage}}
                </div>
                <button type="submit" class="btn btn-primary w-100">Register</button>
              </form>
              <div class="text-center mt-3">
                <p>Already have an account?
                  <a routerLink="/login">Login here</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: '',
    role: 'USER'
  };

  confirmPassword = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    console.log('Submitting registration:', this.user); // Debug log

    if (this.user.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.authService.register(this.user).subscribe({
      next:(response) => {
        console.log('Registration successful:', response); // Debug log
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      }
    });
  }
}
