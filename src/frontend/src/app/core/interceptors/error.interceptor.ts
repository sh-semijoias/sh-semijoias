import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 500) {
        inject(MatSnackBar).open(
          'Ocorreu um erro interno. Tente novamente mais tarde.',
          'Fechar',
          { duration: 8000, panelClass: ['snack-error'] }
        );
      }
      return throwError(() => error);
    })
  );
