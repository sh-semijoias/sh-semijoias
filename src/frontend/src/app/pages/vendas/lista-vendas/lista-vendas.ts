import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendaListagemDto, VendaService, OrdenacaoVenda } from '../../../core/services/venda.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ClientesService, ClientesDto } from '../../../core/services/clientes.service';
import { EstoqueService, ProdutoResumidoDto } from '../../../core/services/estoque.service';
import { AuthService } from '../../../core/services/auth.service';
import { Perfil } from '../../../core/enums/perfil.enum';
import { DialogConfirmarCancelamentoComponent, DialogConfirmarCancelamentoResult } from '../dialog-confirmar-cancelamento/dialog-confirmar-cancelamento';
import { AutocompletePaginadoComponent } from '../../../shared/components/autocomplete-paginado/autocomplete-paginado';

interface RevendedorOpcao { id: string; nome: string; }

@Component({
  selector: 'app-lista-vendas',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatMenuModule,
    AutocompletePaginadoComponent,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './lista-vendas.html'
})
export class ListaVendasComponent implements OnInit, OnDestroy {
  private readonly service = inject(VendaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly clientesService = inject(ClientesService);
  private readonly estoqueService = inject(EstoqueService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  readonly isAdmin = computed(() => this.auth.currentUser()?.role === Perfil.Administrador);

  private readonly colunaParaOrdenacao: Record<string, OrdenacaoVenda> = {
    dataVenda: OrdenacaoVenda.DataVenda,
    nomeCliente: OrdenacaoVenda.NomeCliente,
    nomeRevendedora: OrdenacaoVenda.NomeRevendedora,
    valorTotal: OrdenacaoVenda.ValorTotal,
  };

  readonly statusFiltro = signal<boolean | null>(false);

  get colunas(): string[] {
    const base = ['dataVenda', 'nomeCliente', 'totalItens', 'valorTotal', 'formaPagamento', 'status', 'acoes'];
    return this.isAdmin() ? [...base.slice(0, 2), 'nomeRevendedora', ...base.slice(2)] : base;
  }

  podeCancelar(item: VendaListagemDto): boolean {
    const uid = this.auth.currentUser()?.userId;
    return !item.dataCancelamento && (this.isAdmin() || item.idUsuario === uid);
  }

  readonly itens = signal<VendaListagemDto[]>([]);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal(false);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly tamanhoPagina = signal(10);
  readonly ordenarPor = signal<OrdenacaoVenda | null>(null);
  readonly ordemDecrescente = signal(true);
  readonly totalVendasPeriodo = signal(0);
  readonly filtrosAbertos = signal(false);

  readonly revendedorControl = new FormControl<RevendedorOpcao | null>(null);
  readonly clienteControl = new FormControl<ClientesDto | string | null>(null);
  readonly produtoControl = new FormControl<ProdutoResumidoDto | string | null>(null);
  readonly dataInicioControl = new FormControl<Date | null>(null);
  readonly dataFimControl = new FormControl<Date | null>(null);

  readonly displayRevendedor = (r: RevendedorOpcao | null): string => r?.nome ?? '';
  readonly displayCliente = (c: ClientesDto | string | null): string =>
    c && typeof c === 'object' ? c.nome : '';
  readonly displayProduto = (p: ProdutoResumidoDto | string | null): string =>
    p && typeof p === 'object' ? p.descricao : '';

  private idDe<T extends { id: string | number }>(valor: T | string | null): T['id'] | undefined {
    return valor && typeof valor === 'object' ? valor.id : undefined;
  }

  get filtrosAtivosCount(): number {
    return [
      this.idDe(this.revendedorControl.value),
      this.idDe(this.clienteControl.value),
      this.idDe(this.produtoControl.value),
      this.dataInicioControl.value,
      this.dataFimControl.value,
      this.statusFiltro() !== false ? true : null,
    ].filter(v => v != null && v !== '').length;
  }

  readonly loadClientesFn = (pagina: number, busca: string) =>
    this.clientesService.listar(pagina, 10, busca || undefined);
  readonly loadProdutosFn = (pagina: number, busca: string) =>
    this.estoqueService.listarProdutos(busca || undefined, pagina, 10);
  readonly loadRevendedoresFn = (pagina: number, busca: string) =>
    this.usuarioService.listarRevendedoresPaginado(pagina, busca);

  ngOnInit(): void {
    this.dataInicioControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.pagina.set(1); this.carregar(); });

    this.dataFimControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.pagina.set(1); this.carregar(); });

    this.carregar();
  }

  onClienteAlterado(): void { this.pagina.set(1); this.carregar(); }
  onProdutoAlterado(): void { this.pagina.set(1); this.carregar(); }
  onRevendedorAlterado(): void { this.pagina.set(1); this.carregar(); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erroCarregamento.set(false);

    const dataInicio = this.dataInicioControl.value;
    const dataFim = this.dataFimControl.value;

    this.service.listar({
      pagina: this.pagina(),
      tamanhoPagina: this.tamanhoPagina(),
      idRevendedora: this.idDe(this.revendedorControl.value) as string | undefined,
      idCliente: this.idDe(this.clienteControl.value) as number | undefined,
      idProduto: this.idDe(this.produtoControl.value) as number | undefined,
      dataInicio: dataInicio ? dataInicio.toISOString() : undefined,
      dataFim: dataFim ? dataFim.toISOString() : undefined,
      ordenarPor: this.ordenarPor() ?? undefined,
      ordemDecrescente: this.ordemDecrescente(),
      cancelada: this.statusFiltro(),
    }).subscribe({
      next: (resultado) => {
        this.itens.set(resultado.items);
        this.total.set(resultado.total);
        this.totalVendasPeriodo.set(resultado.totalVendasPeriodo);
        this.carregando.set(false);
      },
      error: () => {
        this.erroCarregamento.set(true);
        this.carregando.set(false);
      }
    });
  }

  onPaginaChange(event: PageEvent): void {
    this.pagina.set(event.pageIndex + 1);
    this.tamanhoPagina.set(event.pageSize);
    this.carregar();
  }

  cancelarVenda(item: VendaListagemDto): void {
    const ref = this.dialog.open(DialogConfirmarCancelamentoComponent, {
      data: { nomeCliente: item.nomeCliente },
      width: '420px',
    });

    ref.afterClosed().subscribe((resultado: DialogConfirmarCancelamentoResult | undefined) => {
      if (!resultado) return;
      this.service.cancelar(item.id, { idMotivoCancelamentoVenda: resultado.idMotivoCancelamentoVenda }).subscribe({
        next: () => this.carregar(),
        error: () => this.snackBar.open('Não foi possível cancelar a venda.', 'Fechar', { duration: 4000 }),
      });
    });
  }

  aoOrdenar(sort: Sort): void {
    if (sort.direction === '') {
      this.ordenarPor.set(null);
      this.ordemDecrescente.set(true);
    } else {
      this.ordenarPor.set(this.colunaParaOrdenacao[sort.active] ?? OrdenacaoVenda.DataVenda);
      this.ordemDecrescente.set(sort.direction === 'desc');
    }
    this.pagina.set(1);
    this.carregar();
  }
}
