import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (auth.currentUser()?.role === 'Admin') return true;

  const redirectMap: Record<string, string> = {
    PlanificationResponsable: '/planner',
    Worker:                   '/worker',
  };
  const role = auth.currentUser()?.role ?? '';
  router.navigate([redirectMap[role] ?? '/auth/login']);
  return false;
};
