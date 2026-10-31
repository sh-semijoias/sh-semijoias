import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { CurvaAbcService } from '../../curva-abc.service';
import { DashboardFiltrosService } from '../../dashboard-filtros.service';
import { CardIndicadorComponent } from '../../components/card-indicador/card-indicador';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';
import { formatarMoedaCurta } from '../../graficos/formatadores';

@Component({
  selector: 'app-card-produtos-por-classe',
  standalone: true,
  imports: [CardIndicadorComponent, SkeletonComponent, MatTabsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './produtos-por-classe.html',
  styleUrl: './produtos-por-classe.scss',
})
export class CardProdutosPorClasseComponent {
  private readonly curvaAbcService = inject(CurvaAbcService);
  private readonly filtros = inject(DashboardFiltrosService);

  protected readonly curvaAbc = this.curvaAbcService.curvaAbc;
  protected readonly semVendas = this.curvaAbcService.semVendas;
  protected readonly abaSelecionada = signal(0);

  // Com uma categoria filtrada, todos os produtos são dela: repetir a categoria em cada linha seria ruído
  protected readonly exibirCategoria = computed(() => this.filtros.filtros().idTipoProduto === null);

  protected readonly subtitulo = computed(() => {
    const dados = this.curvaAbc.value();
    if (!dados || this.semVendas()) return '';
    const produtos = dados.totalProdutos === 1 ? '1 produto' : `${dados.totalProdutos} produtos`;
    return `${produtos} no período · ${formatarMoedaCurta(dados.faturamento)}`;
  });
}
