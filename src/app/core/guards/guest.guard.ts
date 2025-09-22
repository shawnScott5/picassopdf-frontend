import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

   // Extract the token from the query parameters
   const urlParams = new URLSearchParams(window.location.search);
   const token = urlParams.get('token');
   if(token) {
    router.navigate([`/reset-password/${token}`]);
   } else if (authService.isLoggedIn) {
    router.navigate(['/app/dashboard']);
    return false; // Block access to the guarded route
  }
  return true; // Allow access for guests
};