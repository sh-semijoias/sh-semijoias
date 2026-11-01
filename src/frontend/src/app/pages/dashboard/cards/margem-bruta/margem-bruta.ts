import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardFiltrosService } from '../../dashboard-filtros.service';
import { CardKpiComponent } from '../../components/card-kpi/card-kpi';
import { VariacaoComponent } from '../../components/variacao/variacao';

@Component({
  selector: 'app-card-margem-bruta',
  standalone: true,
  imports: [CardKpiComponent, VariacaoComponent, DecimalPipe],
  templateUrl: './margem-bruta.html',
})
export class CardMargemBrutaComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly filtros = inject(DashboardFiltrosService);

  protected readonly margemBruta = rxResource({
    params: () => this.filtros.filtrosApi(),
    stream: ({ params }) => this.dashboardService.obterMargemBruta(params),
  });
}
