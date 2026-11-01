import { Component } from '@angular/core';
import { provideEchartsCore } from 'ngx-echarts';
import { DashboardFiltrosService } from './dashboard-filtros.service';
import { CurvaAbcService } from './curva-abc.service';
import { CardTicketMedioComponent } from './cards/ticket-medio/ticket-medio';
import { CardTicketMedioMensalComponent } from './cards/ticket-medio-mensal/ticket-medio-mensal';
import { CardCurvaAbcComponent } from './cards/curva-abc/curva-abc';
import { CardProdutosPorClasseComponent } from './cards/produtos-por-classe/produtos-por-classe';
import { CardFaturamentoClientesComponent } from './cards/faturamento-clientes/faturamento-clientes';
import { FiltrosDashboardComponent } from './components/filtros-dashboard/filtros-dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FiltrosDashboardComponent, CardTicketMedioComponent, CardCurvaAbcComponent, CardProdutosPorClasseComponent, CardTicketMedioMensalComponent, CardFaturamentoClientesComponent],
  providers: [DashboardFiltrosService, CurvaAbcService, provideEchartsCore({ echarts: () => import('./graficos/echarts') })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {}
