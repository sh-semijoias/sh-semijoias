import { Injectable, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardFiltrosService } from './dashboard-filtros.service';

// Dias de estoque compartilhado pelos cards "Dias de estoque (DSI)" (KPI e detalhado): uma única requisição por filtro.
// Fornecido no DashboardComponent.
@Injectable()
export class DiasEstoqueService {
  private readonly dashboardService = inject(DashboardService);
  private readonly filtros = inject(DashboardFiltrosService);

  readonly diasEstoque = rxResource({
    params: () => this.filtros.filtrosApi(),
    stream: ({ params }) => this.dashboardService.obterDiasEstoque(params),
  });

  // value() lança exceção com o recurso em erro: os cards leem os dados por aqui
  readonly dados = computed(() => (this.diasEstoque.hasValue() ? this.diasEstoque.value() : undefined));

  // Sem vendas, o DSI não é calculado
  readonly semVendas = computed(() => this.dados()?.diasEstoque === null);
}
