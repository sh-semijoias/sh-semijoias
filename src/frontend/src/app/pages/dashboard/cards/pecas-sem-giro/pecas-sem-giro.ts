import { Component, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';

import { DashboardService } from '../../../../core/services/dashboard.service';
import { CardKpiComponent } from '../../components/card-kpi/card-kpi';

@Component({
  selector: 'app-card-pecas-sem-giro',
  standalone: true,
  imports: [CardKpiComponent, CurrencyPipe, DecimalPipe],
  templateUrl: './pecas-sem-giro.html',
})
export class CardPecasSemGiroComponent {
  private readonly dashboardService = inject(DashboardService);

  protected readonly pecasSemGiro = rxResource({
    stream: () => this.dashboardService.obterPecasSemGiro(),
  });
}
