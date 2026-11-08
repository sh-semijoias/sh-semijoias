import { Component, input } from '@angular/core';

// Barra horizontal simples, proporcional a um valor de referência (0 a 100%). Decorativa: o número fica no texto ao lado,
// por isso aria-hidden. A cor é uma variável CSS (ex.: var(--cor-classe-a))
@Component({
  selector: 'app-barra',
  standalone: true,
  host: { 'aria-hidden': 'true' },
  template: `<span class="preenchimento" [style.width.%]="percentual()" [style.background-color]="cor()"></span>`,
  styles: `
    :host {
      position: relative;
      display: block;
      height: 0.5rem;
      overflow: hidden;
      border-radius: 9999px;
      background-color: var(--mat-sys-surface-container-highest);
    }

    .preenchimento {
      position: absolute;
      inset: 0 auto 0 0;
      border-radius: inherit;
    }
  `,
})
export class BarraComponent {
  // Largura preenchida, de 0 a 100
  readonly percentual = input.required<number>();
  readonly cor = input('var(--mat-sys-primary)');
}
