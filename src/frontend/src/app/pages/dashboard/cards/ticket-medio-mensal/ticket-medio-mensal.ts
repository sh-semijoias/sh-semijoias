import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardFiltrosService } from '../../dashboard-filtros.service';
import { CardIndicadorComponent } from '../../components/card-indicador/card-indicador';
import { GraficoComponent } from '../../graficos/grafico';
import { MenuGraficoComponent } from '../../graficos/menu-grafico';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';
import { descreverTicketMensal, montarOpcoesTicketMensal, tabelaTicketMensal } from './grafico-ticket-mensal';

@Component({
  selector: 'app-card-ticket-medio-mensal',
  standalone: true,
  imports: [CardIndicadorComponent, GraficoComponent, MenuGraficoComponent, SkeletonComponent, DecimalPipe],
  templateUrl: './ticket-medio-mensal.html',
})
export class CardTicketMedioMensalComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly filtros = inject(DashboardFiltrosService);

  protected readonly ticketMensal = rxResource({
    params: () => this.filtros.filtrosSemPeriodo(),
    stream: ({ params }) => this.dashboardService.obterTicketMedioMensal(params),
  });

  protected readonly exibirTabela = signal(false);

  // value() lança exceção com o recurso em erro: o template lê os dados por aqui
  protected readonly valor = computed(() => (this.ticketMensal.hasValue() ? this.ticketMensal.value() : undefined));

  private readonly meses = computed(() => this.valor()?.meses ?? []);

  protected readonly semVendas = computed(() => this.meses().every(m => m.ticketMedio === null));
  protected readonly opcoes = computed(() => montarOpcoesTicketMensal(this.meses()));
  protected readonly descricao = computed(() => (this.semVendas() ? '' : descreverTicketMensal(this.meses())));
  protected readonly tabela = computed(() => tabelaTicketMensal(this.meses()));
}
