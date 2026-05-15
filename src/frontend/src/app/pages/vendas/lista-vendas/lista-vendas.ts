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
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { VendaListagemDto, VendaService, OrdenacaoVenda } from '../../../core/services/venda.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { Perfil } from '../../../core/enums/perfil.enum';

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
    MatSelectModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './lista-vendas.html'
})
export class ListaVendasComponent implements OnInit, OnDestroy {
  private readonly service = inject(VendaService);
  private readonly usuarioService = inject(UsuarioService);
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
  readonly revendedoras = signal<{ id: string; nome: string }[]>([]);
  readonly filtrosAbertos = signal(false);

  readonly nomeClienteControl = new FormControl('');
  readonly nomeProdutoControl = new FormControl('');
  readonly idRevendedoraControl = new FormControl<string | null>(null);
  readonly dataInicioControl = new FormControl<Date | null>(null);
  readonly dataFimControl = new FormControl<Date | null>(null);

  get filtrosAtivosCount(): number {
    return [
      this.nomeClienteControl.value,
      this.nomeProdutoControl.value,
      this.idRevendedoraControl.value,
      this.dataInicioControl.value,
      this.dataFimControl.value,
    ].filter(v => v != null && v !== '').length;
  }

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.usuarioService.listarRevendedores().subscribe(lista => this.revendedoras.set(lista));
    }

    this.nomeClienteControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => { this.pagina.set(1); this.carregar(); });

    this.nomeProdutoControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => { this.pagina.set(1); this.carregar(); });

    this.idRevendedoraControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.pagina.set(1); this.carregar(); });

    this.dataInicioControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.pagina.set(1); this.carregar(); });

    this.dataFimControl.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => { this.pagina.set(1); this.carregar(); });

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
      idRevendedora: this.idRevendedoraControl.value ?? undefined,
      nomeCliente: this.nomeClienteControl.value ?? undefined,
      nomeProduto: this.nomeProdutoControl.value ?? undefined,
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
