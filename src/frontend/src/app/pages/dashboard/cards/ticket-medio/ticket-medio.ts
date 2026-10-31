import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardFiltrosService } from '../../dashboard-filtros.service';
import { CardKpiComponent } from '../../components/card-kpi/card-kpi';
import { VariacaoComponent } from '../../components/variacao/variacao';

@Component({
  selector: 'app-card-ticket-medio',
  standalone: true,
  imports: [CardKpiComponent, VariacaoComponent, CurrencyPipe, DecimalPipe],
  templateUrl: './ticket-medio.html',
})
export class CardTicketMedioComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly filtros = inject(DashboardFiltrosService);

  protected readonly ticketMedio = rxResource({
    params: () => this.filtros.filtrosApi(),
    stream: ({ params }) => this.dashboardService.obterTicketMedio(params),
  });

  // value() lança exceção com o recurso em erro: o template lê os dados por aqui
  protected readonly valor = computed(() => (this.ticketMedio.hasValue() ? this.ticketMedio.value() : undefined));
}
