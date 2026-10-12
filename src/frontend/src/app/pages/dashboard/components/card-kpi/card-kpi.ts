import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';

export type CorCardKpi = 'indigo' | 'teal' | 'violet' | 'orange';

const CORES: Record<CorCardKpi, { fundo: string; icone: string }> = {
  indigo: { fundo: 'bg-indigo-500/15 dark:bg-indigo-900/40', icone: 'text-indigo-700! dark:text-indigo-400!' },
  teal: { fundo: 'bg-teal-500/15 dark:bg-teal-900/40', icone: 'text-teal-700! dark:text-teal-400!' },
  violet: { fundo: 'bg-violet-500/15 dark:bg-violet-900/40', icone: 'text-violet-700! dark:text-violet-400!' },
  orange: { fundo: 'bg-orange-500/15 dark:bg-orange-900/40', icone: 'text-orange-700! dark:text-orange-400!' },
};

@Component({
  selector: 'app-card-kpi',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatTooltipModule, SkeletonComponent],
  templateUrl: './card-kpi.html',
})
export class CardKpiComponent {
  readonly icone = input.required<string>();
  readonly cor = input<CorCardKpi>('indigo');
  readonly titulo = input.required<string>();
  readonly ajuda = input<string>();
  readonly carregando = input(false);
  readonly erro = input(false);

  protected readonly classesCor = computed(() => CORES[this.cor()]);
}
