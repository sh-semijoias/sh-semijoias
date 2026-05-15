import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { VendaListagemDto, VendaService, OrdenacaoVenda } from '../../../core/services/venda.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ClientesService, ClientesDto } from '../../../core/services/clientes.service';
import { EstoqueService, ProdutoResumidoDto } from '../../../core/services/estoque.service';
import { AuthService } from '../../../core/services/auth.service';
import { Perfil } from '../../../core/enums/perfil.enum';

interface RevendedorOpcao { id: string; nome: string; }

@Component({
  selector: 'app-lista-vendas',
  standalone: true,
  imports: [
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
    MatAutocompleteModule,
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
  private readonly destroy$ = new Subject<void>();

  readonly isAdmin = computed(() => this.auth.currentUser()?.role === Perfil.Administrador);

  private readonly colunaParaOrdenacao: Record<string, OrdenacaoVenda> = {
    dataVenda: OrdenacaoVenda.DataVenda,
    nomeCliente: OrdenacaoVenda.NomeCliente,
    nomeRevendedora: OrdenacaoVenda.NomeRevendedora,
    valorTotal: OrdenacaoVenda.ValorTotal,
  };

  get colunas(): string[] {
    const base = ['dataVenda', 'nomeCliente', 'totalProdutos', 'totalItens', 'valorTotal', 'formaPagamento'];
    return this.isAdmin() ? [...base.slice(0, 2), 'nomeRevendedora', ...base.slice(2)] : base;
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

  readonly revendedoras = signal<RevendedorOpcao[]>([]);
  readonly clientesOpcoes = signal<ClientesDto[]>([]);
  readonly produtosOpcoes = signal<ProdutoResumidoDto[]>([]);

  readonly revendedorControl = new FormControl<RevendedorOpcao | string | null>(null);
  readonly clienteControl = new FormControl<ClientesDto | string | null>(null);
  readonly produtoControl = new FormControl<ProdutoResumidoDto | string | null>(null);
  readonly dataInicioControl = new FormControl<Date | null>(null);
  readonly dataFimControl = new FormControl<Date | null>(null);

  readonly revendedoresOpcoes = computed(() => {
    const valor = this.revendedorControl.value;
    const termo = typeof valor === 'string' ? valor.toLowerCase() : '';
    return this.revendedoras().filter(r => !termo || r.nome.toLowerCase().includes(termo));
  });

  readonly displayRevendedor = (r: RevendedorOpcao | string | null): string =>
    r && typeof r === 'object' ? r.nome : '';
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
    ].filter(v => v != null && v !== '').length;
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.usuarioService.listarRevendedores().subscribe(lista => this.revendedoras.set(lista));
    }

    this.revendedorControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(valor => {
        if (typeof valor !== 'string') { this.pagina.set(1); this.carregar(); }
        else if (valor === '') { this.pagina.set(1); this.carregar(); }
      });

    this.clienteControl.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(valor => {
      if (typeof valor === 'string') {
        this.clientesService.listar(1, 10, valor || undefined)
          .subscribe(res => this.clientesOpcoes.set(res.items));
        if (valor === '') { this.pagina.set(1); this.carregar(); }
      } else {
        this.pagina.set(1);
        this.carregar();
      }
    });

    this.produtoControl.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(valor => {
      if (typeof valor === 'string') {
        this.estoqueService.listarProdutos(valor || undefined, 1, 10)
          .subscribe(res => this.produtosOpcoes.set(res.items));
        if (valor === '') { this.pagina.set(1); this.carregar(); }
      } else {
        this.pagina.set(1);
        this.carregar();
      }
    });

    this.dataInicioControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.pagina.set(1); this.carregar(); });

    this.dataFimControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.pagina.set(1); this.carregar(); });

    this.clientesService.listar(1, 10).subscribe(res => this.clientesOpcoes.set(res.items));
    this.estoqueService.listarProdutos(undefined, 1, 10).subscribe(res => this.produtosOpcoes.set(res.items));

    this.carregar();
  }

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
