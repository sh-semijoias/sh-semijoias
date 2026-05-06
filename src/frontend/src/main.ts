import { registerLocaleData } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import localePtBr from '@angular/common/locales/pt';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localePtBr, 'pt-BR');

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
