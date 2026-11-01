import { Component } from '@angular/core';
import { provideEchartsCore } from 'ngx-echarts';
import { DashboardFiltrosService } from './dashboard-filtros.service';
import { CurvaAbcService } from './curva-abc.service';
import { CardTicketMedioComponent } from './cards/ticket-medio/ticket-medio';
import { CardTicketMedioMensalComponent } from './cards/ticket-medio-mensal/ticket-medio-mensal';
import { CardCurvaAbcComponent } from './cards/curva-abc/curva-abc';
import { CardProdutosPorClasseComponent } from './cards/produtos-por-classe/produtos-por-classe';
import { FiltrosDashboardComponent } from './components/filtros-dashboard/filtros-dashboard';
import { CardMargemBrutaComponent } from './cards/margem-bruta/margem-bruta';
import { CardDiasEstoqueComponent } from './cards/dias-estoque/dias-estoque';
import { CardPecasSemGiroComponent } from './cards/pecas-sem-giro/pecas-sem-giro';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FiltrosDashboardComponent, CardTicketMedioComponent, CardCurvaAbcComponent, CardProdutosPorClasseComponent, CardTicketMedioMensalComponent,CardMargemBrutaComponent, CardDiasEstoqueComponent, CardPecasSemGiroComponent],
  providers: [DashboardFiltrosService, CurvaAbcService, provideEchartsCore({ echarts: () => import('./graficos/echarts') })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {}
