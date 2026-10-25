import { Component } from '@angular/core';

// Bloco de carregamento: o tamanho e o formato vêm das classes de quem usa (ex: class="h-5 w-28", "rounded-full")
@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: '',
  host: {
    class: 'block rounded',
    'aria-hidden': 'true',
  },
  styles: `
    :host {
      --cor-base: var(--mat-sys-surface-container-highest);
      --cor-brilho: color-mix(in srgb, var(--mat-sys-surface-container-highest), var(--mat-sys-on-surface) 12%);

      background: linear-gradient(90deg, var(--cor-base) 25%, var(--cor-brilho) 50%, var(--cor-base) 75%);
      background-size: 200% 100%;
      animation: brilho 1.5s ease-in-out infinite;
    }

    @keyframes brilho {
      from { background-position: 200% 0; }
      to { background-position: -200% 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        animation: none;
      }
    }
  `,
})
export class SkeletonComponent {}
