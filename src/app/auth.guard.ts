import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getCurrentUser()) {
    if (authService.getCurrentUser()?.role === 'ADMIN') {
      router.navigate(['/admin']);
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.getCurrentUser()?.role === 'ADMIN') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
