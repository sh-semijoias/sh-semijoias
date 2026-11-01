import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ClasseAbc, DashboardService, FiltrosIndicadores, ProdutoAbcDto } from '../../../../core/services/dashboard.service';
import { ListaPaginada } from '../../../../core/services/usuario.service';
import { CurvaAbcService } from '../../curva-abc.service';
import { DashboardFiltrosService } from '../../dashboard-filtros.service';
import { CardIndicadorComponent } from '../../components/card-indicador/card-indicador';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';
import { formatarMoedaCurta } from '../../graficos/formatadores';

const TAMANHO_PAGINA = 5;
// A ordem das abas: a curva sempre traz as três classes quando há faturamento
const CLASSES: ClasseAbc[] = ['A', 'B', 'C'];

interface UltimaPagina {
  filtros: FiltrosIndicadores;
  classe: ClasseAbc;
  valor: ListaPaginada<ProdutoAbcDto> | undefined;
}

@Component({
  selector: 'app-card-produtos-por-classe',
  standalone: true,
  imports: [CardIndicadorComponent, SkeletonComponent, MatTabsModule, MatPaginatorModule, CurrencyPipe, DecimalPipe],
  templateUrl: './produtos-por-classe.html',
  styleUrl: './produtos-por-classe.scss',
})
export class CardProdutosPorClasseComponent {
  private readonly curvaAbcService = inject(CurvaAbcService);
  private readonly dashboardService = inject(DashboardService);
  private readonly filtros = inject(DashboardFiltrosService);

  protected readonly tamanhoPagina = TAMANHO_PAGINA;
  protected readonly linhasEsqueleto = Array.from({ length: TAMANHO_PAGINA });
  protected readonly curvaAbc = this.curvaAbcService.curvaAbc;
  protected readonly semVendas = this.curvaAbcService.semVendas;
  protected readonly dados = computed(() => (this.semVendas() ? undefined : this.curvaAbcService.dados()));
  protected readonly abaSelecionada = signal(0);
  private readonly classe = computed(() => CLASSES[this.abaSelecionada()]);

  // Volta para a primeira página quando os filtros do dashboard ou a aba mudam
  protected readonly pagina = linkedSignal({
    source: () => ({ filtros: this.filtros.filtrosApi(), classe: this.classe() }),
    computation: () => 1,
  });

  // Só a aba aberta é carregada, em paralelo com a curva (não depende dela)
  protected readonly lista = rxResource({
    params: () => ({
      ...this.filtros.filtrosApi(),
      classe: this.classe(),
      pagina: this.pagina(),
      tamanhoPagina: TAMANHO_PAGINA,
    }),
    stream: ({ params }) => this.dashboardService.listarProdutosAbc(params),
  });

  // Ao paginar, a página anterior continua visível enquanto a próxima carrega (sem a lista piscar o skeleton);
  // ao trocar de aba ou de filtros, descarta e exibe o skeleton.
  // value() lança exceção com o recurso em erro: o template lê os dados por aqui
  protected readonly produtos = linkedSignal<UltimaPagina, ListaPaginada<ProdutoAbcDto> | undefined>({
    source: () => ({
      filtros: this.filtros.filtrosApi(),
      classe: this.classe(),
      valor: this.lista.hasValue() ? this.lista.value() : undefined,
    }),
    computation: (atual, anterior) =>
      atual.valor ??
      (anterior?.source.filtros === atual.filtros && anterior.source.classe === atual.classe ? anterior.value : undefined),
  });

  protected readonly atualizando = computed(() => this.lista.isLoading() && !!this.produtos());

  // Com uma categoria filtrada, todos os produtos são dela: repetir a categoria em cada linha seria ruído
  protected readonly exibirCategoria = computed(() => this.filtros.filtros().idTipoProduto === null);

  protected readonly subtitulo = computed(() => {
    const dados = this.dados();
    if (!dados) return '';
    const produtos = dados.totalProdutos === 1 ? '1 produto' : `${dados.totalProdutos} produtos`;
    return `${produtos} no período · ${formatarMoedaCurta(dados.faturamento)}`;
  });

  protected aoPaginar(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex + 1);
  }
}
