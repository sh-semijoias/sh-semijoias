import { Component, computed, inject, input } from '@angular/core';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsCoreOption } from 'echarts/core';
import { TemaService } from '../../../core/services/tema.service';
import { lerPaletaGrafico, temaEcharts } from './tema-grafico';

// Alternativa acessível ao gráfico: o mesmo dado em forma de tabela
export interface TabelaGrafico {
  colunas: string[];
  linhas: string[][];
}

// Gráfico do dashboard: aplica o tema da aplicação e sempre oferece resumo em texto e tabela,
// já que o desenho do gráfico não é acessível a leitores de tela nem ao teclado.
// A troca para tabela visível fica no menu do cabeçalho do card (app-menu-grafico), ligado a exibirTabela.
@Component({
  selector: 'app-grafico',
  standalone: true,
  imports: [NgxEchartsDirective],
  templateUrl: './grafico.html',
  styleUrl: './grafico.scss',
  host: { class: 'block' },
})
export class GraficoComponent {
  private readonly tema = inject(TemaService);

  readonly opcoes = input.required<EChartsCoreOption>();
  readonly descricao = input.required<string>();
  readonly tabela = input.required<TabelaGrafico>();
  readonly altura = input('h-56');
  readonly exibirTabela = input(false);

  protected readonly temaGrafico = computed(() => {
    this.tema.escuro();
    return temaEcharts(lerPaletaGrafico());
  });

  protected readonly opcoesFinais = computed<EChartsCoreOption>(() => ({
    animation: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    ...this.opcoes(),
  }));
}
