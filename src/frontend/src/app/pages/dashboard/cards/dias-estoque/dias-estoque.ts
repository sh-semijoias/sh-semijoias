import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardFiltrosService } from '../../dashboard-filtros.service';
import { CardKpiComponent } from '../../components/card-kpi/card-kpi';

@Component({
  selector: 'app-card-dias-estoque',
  standalone: true,
  imports: [CardKpiComponent, DecimalPipe],
  templateUrl: './dias-estoque.html',
})
export class CardDiasEstoqueComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly filtros = inject(DashboardFiltrosService);

  protected readonly diasEstoque = rxResource({
    params: () => this.filtros.filtrosApi(),
    stream: ({ params }) => this.dashboardService.obterDiasEstoque(params),
  });
}
