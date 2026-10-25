import { Injectable, signal } from '@angular/core';

// Tema claro/escuro da aplicação: aplica a classe no <html> e persiste a escolha no localStorage
@Injectable({ providedIn: 'root' })
export class TemaService {
  private readonly _escuro = signal(this.temaInicial());
  readonly escuro = this._escuro.asReadonly();

  constructor() {
    this.aplicar(this._escuro());
  }

  alternar(): void {
    const escuro = !this._escuro();
    localStorage.setItem('darkMode', String(escuro));
    this.aplicar(escuro);
    this._escuro.set(escuro);
  }

  private temaInicial(): boolean {
    const salvo = localStorage.getItem('darkMode');
    return salvo !== null ? salvo === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private aplicar(escuro: boolean): void {
    document.documentElement.classList.toggle('dark-mode', escuro);
    document.documentElement.classList.toggle('light-mode', !escuro);
  }
}
