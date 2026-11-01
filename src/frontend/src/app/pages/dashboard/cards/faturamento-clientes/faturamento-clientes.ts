import { Component, ElementRef, computed, effect, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort, SortDirection } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  DashboardService,
  FaturamentoClienteDto,
  FiltrosIndicadores,
  OrdenacaoFaturamentoCliente,
} from '../../../../core/services/dashboard.service';
import { ListaPaginada } from '../../../../core/services/usuario.service';
import { DashboardFiltrosService } from '../../dashboard-filtros.service';
import { CardIndicadorComponent } from '../../components/card-indicador/card-indicador';
import { AvatarIniciaisComponent } from '../../../../shared/components/avatar-iniciais/avatar-iniciais';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';

const TAMANHO_PAGINA = 10;

interface Ordenacao {
  coluna: string;
  direcao: SortDirection;
}

interface UltimaLista {
  filtros: FiltrosIndicadores;
  valor: ListaPaginada<FaturamentoClienteDto> | undefined;
}

const ORDENACAO_PADRAO: Ordenacao = { coluna: 'faturamento', direcao: 'desc' };

@Component({
  selector: 'app-card-faturamento-clientes',
  standalone: true,
  imports: [
    CardIndicadorComponent,
    AvatarIniciaisComponent,
    SkeletonComponent,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './faturamento-clientes.html',
  styleUrl: './faturamento-clientes.scss',
})
export class CardFaturamentoClientesComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly filtros = inject(DashboardFiltrosService);

  protected readonly colunas = ['posicao', 'cliente', 'revendedora', 'vendas', 'faturamento', 'percentual', 'ultimaCompra'];
  protected readonly tamanhoPagina = TAMANHO_PAGINA;

  private readonly colunaParaOrdenacao: Record<string, OrdenacaoFaturamentoCliente> = {
    cliente: OrdenacaoFaturamentoCliente.NomeCliente,
    revendedora: OrdenacaoFaturamentoCliente.NomeRevendedora,
    vendas: OrdenacaoFaturamentoCliente.QuantidadeVendas,
    faturamento: OrdenacaoFaturamentoCliente.Faturamento,
    ultimaCompra: OrdenacaoFaturamentoCliente.DataUltimaCompra,
  };

  protected readonly ordenacao = signal<Ordenacao>(ORDENACAO_PADRAO);

  // Volta para a primeira página quando os filtros do dashboard ou a ordenação mudam
  protected readonly pagina = linkedSignal({
    source: () => ({ filtros: this.filtros.filtrosApi(), ordenacao: this.ordenacao() }),
    computation: () => 1,
  });

  protected readonly lista = rxResource({
    params: () => ({
      ...this.filtros.filtrosApi(),
      pagina: this.pagina(),
      tamanhoPagina: TAMANHO_PAGINA,
      ordenarPor: this.colunaParaOrdenacao[this.ordenacao().coluna] ?? OrdenacaoFaturamentoCliente.Faturamento,
      ordemDecrescente: this.ordenacao().direcao === 'desc',
    }),
    stream: ({ params }) => this.dashboardService.listarFaturamentoClientes(params),
  });

  // Ao paginar ou ordenar, a página anterior continua visível enquanto a próxima carrega (sem o card piscar o skeleton);
  // ao trocar os filtros do dashboard, descarta e exibe o skeleton, como os outros cards.
  // value() lança exceção com o recurso em erro: o template lê os dados por aqui
  protected readonly dados = linkedSignal<UltimaLista, ListaPaginada<FaturamentoClienteDto> | undefined>({
    source: () => ({ filtros: this.filtros.filtrosApi(), valor: this.lista.hasValue() ? this.lista.value() : undefined }),
    computation: (atual, anterior) =>
      atual.valor ?? (anterior?.source.filtros === atual.filtros ? anterior.value : undefined),
  });

  protected readonly carregando = computed(() => this.lista.isLoading() && !this.dados());
  protected readonly atualizando = computed(() => this.lista.isLoading() && !!this.dados());
  protected readonly semVendas = computed(() => this.dados()?.total === 0);

  // Período dentro de um só ano: a data da última compra dispensa o ano, como no protótipo
  protected readonly formatoData = computed(() => {
    const { dataInicio, dataFim } = this.filtros.filtrosApi();
    return dataInicio.slice(0, 4) === dataFim.slice(0, 4) ? 'dd/MM' : 'dd/MM/yy';
  });

  // Aviso de rolagem só quando a tabela de fato não cabe no card (o card pode ser estreito também no desktop)
  private readonly rolagem = viewChild<ElementRef<HTMLElement>>('rolagem');
  protected readonly transborda = signal(false);

  constructor() {
    effect(onCleanup => {
      const elemento = this.rolagem()?.nativeElement;
      if (!elemento) return;
      const observador = new ResizeObserver(() => this.transborda.set(elemento.scrollWidth > elemento.clientWidth));
      observador.observe(elemento);
      const tabela = elemento.querySelector('table');
      if (tabela) observador.observe(tabela);
      onCleanup(() => observador.disconnect());
    });
  }

  protected aoOrdenar(sort: Sort): void {
    this.ordenacao.set(sort.direction ? { coluna: sort.active, direcao: sort.direction } : ORDENACAO_PADRAO);
  }

  protected aoPaginar(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex + 1);
  }
}
