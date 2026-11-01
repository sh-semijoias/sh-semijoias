import { Component, computed, input } from '@angular/core';

const TOTAL_CORES = 6;

// Círculo com as iniciais do nome (primeiro e último). Decorativo: quem usa exibe o nome ao lado.
// A cor vem da chave (ex: o id), para a mesma pessoa ter sempre a mesma cor em qualquer tela.
@Component({
  selector: 'app-avatar-iniciais',
  standalone: true,
  template: '{{ iniciais() }}',
  host: {
    'aria-hidden': 'true',
    '[attr.data-cor]': 'cor()',
  },
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 600;
      line-height: 1;
      background-color: var(--fundo);
      color: var(--texto);
    }

    // Fundo e texto com contraste de pelo menos 4,5:1 nos dois temas
    :host([data-cor='0']) { --fundo: light-dark(#dfe0ff, #2e3478); --texto: light-dark(#14196b, #e0e1ff); }
    :host([data-cor='1']) { --fundo: light-dark(#cdeee9, #1f514c); --texto: light-dark(#00332e, #c9f0ea); }
    :host([data-cor='2']) { --fundo: light-dark(#ffdcc5, #6b3a17); --texto: light-dark(#4a2000, #ffe0cc); }
    :host([data-cor='3']) { --fundo: light-dark(#f6d9f0, #5e2c56); --texto: light-dark(#3d0f37, #fbdcf4); }
    :host([data-cor='4']) { --fundo: light-dark(#e2e8c6, #434d1c); --texto: light-dark(#252d00, #e5ecc6); }
    :host([data-cor='5']) { --fundo: light-dark(#dde3ea, #3d4752); --texto: light-dark(#1b2631, #e2e8ef); }
  `,
})
export class AvatarIniciaisComponent {
  readonly nome = input.required<string>();
  readonly chave = input.required<string | number>();

  protected readonly iniciais = computed(() => iniciais(this.nome()));
  protected readonly cor = computed(() => indiceCor(this.chave()));
}

// Primeira letra do primeiro e do último nome, em maiúsculas
export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '';
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return (partes[0][0] + ultima).toLocaleUpperCase('pt-BR');
}

// Índice estável da cor (0 a TOTAL_CORES - 1) a partir da chave
export function indiceCor(chave: string | number): number {
  let hash = 0;
  for (const caractere of String(chave)) hash = (hash * 31 + caractere.charCodeAt(0)) >>> 0;
  return hash % TOTAL_CORES;
}
