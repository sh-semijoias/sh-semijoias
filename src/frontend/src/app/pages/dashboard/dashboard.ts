import { Component } from '@angular/core';
import { provideEchartsCore } from 'ngx-echarts';
import { DashboardFiltrosService } from './dashboard-filtros.service';
import { CurvaAbcService } from './curva-abc.service';
import { MargemBrutaService } from './margem-bruta.service';
import { DiasEstoqueService } from './dias-estoque.service';
import { IdadeEstoqueService } from './idade-estoque.service';
import { CardTicketMedioComponent } from './cards/ticket-medio/ticket-medio';
import { CardTicketMedioMensalComponent } from './cards/ticket-medio-mensal/ticket-medio-mensal';
import { CardCurvaAbcComponent } from './cards/curva-abc/curva-abc';
import { CardProdutosPorClasseComponent } from './cards/produtos-por-classe/produtos-por-classe';
import { CardFaturamentoClientesComponent } from './cards/faturamento-clientes/faturamento-clientes';
import { FiltrosDashboardComponent } from './components/filtros-dashboard/filtros-dashboard';
import { CardMargemBrutaComponent } from './cards/margem-bruta/margem-bruta';
import { CardDiasEstoqueComponent } from './cards/dias-estoque/dias-estoque';
import { CardPecasSemGiroComponent } from './cards/pecas-sem-giro/pecas-sem-giro';
import { CardComposicaoMargemComponent } from './cards/composicao-margem/composicao-margem';
import { CardDiasEstoqueDetalheComponent } from './cards/dias-estoque-detalhe/dias-estoque-detalhe';
import { CardIdadeEstoqueComponent } from './cards/idade-estoque/idade-estoque';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FiltrosDashboardComponent,
    CardTicketMedioComponent,
    CardCurvaAbcComponent,
    CardProdutosPorClasseComponent,
    CardTicketMedioMensalComponent,
    CardMargemBrutaComponent,
    CardDiasEstoqueComponent,
    CardPecasSemGiroComponent,
    CardFaturamentoClientesComponent,
    CardComposicaoMargemComponent,
    CardDiasEstoqueDetalheComponent,
    CardIdadeEstoqueComponent,
  ],
  providers: [DashboardFiltrosService, CurvaAbcService, MargemBrutaService, DiasEstoqueService, IdadeEstoqueService, provideEchartsCore({ echarts: () => import('./graficos/echarts') })],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {}
