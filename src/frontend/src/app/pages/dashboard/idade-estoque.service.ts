import { Injectable, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardFiltrosService } from './dashboard-filtros.service';

// Idade do estoque compartilhada pelos cards "Peças sem giro" (KPI) e "Idade do estoque": uma única requisição por filtro.
// Posição atual: só revendedora e categoria. Fornecido no DashboardComponent.
@Injectable()
export class IdadeEstoqueService {
  private readonly dashboardService = inject(DashboardService);
  private readonly filtros = inject(DashboardFiltrosService);

  readonly idadeEstoque = rxResource({
    params: () => this.filtros.filtrosSemPeriodo(),
    stream: ({ params }) => this.dashboardService.obterIdadeEstoque(params),
  });

  // value() lança exceção com o recurso em erro: os cards leem os dados por aqui
  readonly dados = computed(() => (this.idadeEstoque.hasValue() ? this.idadeEstoque.value() : undefined));

  readonly semEstoque = computed(() => (this.dados()?.faixas ?? []).every(f => f.quantidade === 0));
}
