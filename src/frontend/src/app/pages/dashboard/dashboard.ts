import { Component } from '@angular/core';
import { provideEchartsCore } from 'ngx-echarts';
import { DashboardFiltrosService } from './dashboard-filtros.service';
import { CardTicketMedioComponent } from './cards/ticket-medio/ticket-medio';
import { CardTicketMedioMensalComponent } from './cards/ticket-medio-mensal/ticket-medio-mensal';
import { FiltrosDashboardComponent } from './components/filtros-dashboard/filtros-dashboard';
import { CardMargemBrutaComponent } from './cards/margem-bruta/margem-bruta';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FiltrosDashboardComponent, CardTicketMedioComponent, CardTicketMedioMensalComponent, CardMargemBrutaComponent],
  providers: [DashboardFiltrosService, provideEchartsCore({ echarts: () => import('./graficos/echarts') })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {}
