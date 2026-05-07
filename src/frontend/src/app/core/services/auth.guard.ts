import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { Perfil } from '../enums/perfil.enum';

export const authGuard = (role?: Perfil): CanActivateFn => () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.me().pipe(
    map(user => {
      authService.currentUser.set(user);
      if (role && user.role !== role) return router.parseUrl('/login');
      return true;
    }),
    catchError(() => of(router.parseUrl('/login')))
  );
};
