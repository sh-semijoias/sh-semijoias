import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideNgxMask } from 'ngx-mask';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import {  DateAdapter,  MAT_DATE_FORMATS} from '@angular/material/core';
import { BrDateAdapter } from './shared/br-date-adapter';

import { routes } from './app.routes';
import { authInterceptor } from './core/services/auth.interceptor';

function paginatorIntlPtBr(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();
  intl.itemsPerPageLabel = 'Itens por página:';
  intl.nextPageLabel = 'Próxima página';
  intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel = 'Primeira página';
  intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = (page, pageSize, length) => {
    if (length === 0) return '0 de 0';
    const start = page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, length);
    return `${start} – ${end} de ${length}`;
  };
  return intl;
}

export const BR_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideRouter(routes),
    provideNgxMask(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
        {  provide: DateAdapter,  useClass: BrDateAdapter},
{  provide: MAT_DATE_FORMATS,  useValue: BR_DATE_FORMATS},
    { provide: MatPaginatorIntl, useFactory: paginatorIntlPtBr }
  ]
};


