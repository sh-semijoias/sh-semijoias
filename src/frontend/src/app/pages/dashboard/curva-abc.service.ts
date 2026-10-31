import { Injectable, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardFiltrosService } from './dashboard-filtros.service';

// Curva ABC compartilhada pelos cards "Curva ABC por produto" e "Produtos por classe": uma única requisição por filtro.
// Fornecido no DashboardComponent.
@Injectable()
export class CurvaAbcService {
  private readonly dashboardService = inject(DashboardService);
  private readonly filtros = inject(DashboardFiltrosService);

  readonly curvaAbc = rxResource({
    params: () => this.filtros.filtrosApi(),
    stream: ({ params }) => this.dashboardService.obterCurvaAbc(params),
  });

  readonly semVendas = computed(() => (this.curvaAbc.value()?.faturamento ?? 0) === 0);
}
