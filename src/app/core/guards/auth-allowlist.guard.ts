import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional Route Guard: Enforces Single-User Google Account Verification
 */
export const authAllowlistGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If not authenticated or not the authorized user, reject
  if (authService.isAuthenticated()) {
    if (authService.isAuthorizedUser()) {
      return true;
    } else {
      router.navigate(['/settings']);
      return false;
    }
  }

  return true;
};

