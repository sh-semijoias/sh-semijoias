import { Component, computed, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-variacao',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    @let v = valor();
    @if (v !== null) {
      <span class="inline-flex items-center gap-0.5 font-medium"
            [class]="v >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'"
            [attr.aria-label]="(v >= 0 ? 'Alta de ' : 'Queda de ') + (absoluto() | number:'1.1-1':'pt-BR') + sufixo()">
        {{ v >= 0 ? '▲' : '▼' }} {{ absoluto() | number:'1.1-1':'pt-BR' }}{{ sufixo() }}
      </span>
    }
  `,
})
export class VariacaoComponent {
  readonly valor = input.required<number | null>();
  readonly unidade = input<'%' | 'p.p.'>('%');

  protected readonly absoluto = computed(() => Math.abs(this.valor() ?? 0));
  protected readonly sufixo = computed(() => (this.unidade() === '%' ? '%' : ' p.p.'));
}
