import { Component, OnInit, OnDestroy, inject, signal, LOCALE_ID } from '@angular/core';
import { CurrencyPipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { EstoqueDto, EstoqueService, OrdenacaoEstoque } from '../../../core/services/estoque.service';
import { DialogEditarQuantidadeComponent } from '../dialog-editar-quantidade/dialog-editar-quantidade';

@Component({
  selector: 'app-lista-estoque',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatMenuModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSortModule,
    CurrencyPipe,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './lista-estoque.html'
})
export class ListaEstoqueComponent implements OnInit, OnDestroy {
  private readonly service = inject(EstoqueService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();

  private readonly colunaParaOrdenacao: Record<string, OrdenacaoEstoque> = {
    produto:             OrdenacaoEstoque.Produto,
    tipo:                OrdenacaoEstoque.Tipo,
    quantidade:          OrdenacaoEstoque.Quantidade,
    precoCompra:         OrdenacaoEstoque.PrecoCompra,
    precoVendaSugerido:  OrdenacaoEstoque.PrecoVendaSugerido,
  };

  readonly colunas = ['produto', 'tipo', 'quantidade', 'precoCompra', 'precoVendaSugerido', 'acoes'];
  readonly itens = signal<EstoqueDto[]>([]);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal(false);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly tamanhoPagina = signal(5);
  readonly emEstoque = signal<boolean | null>(null);
  readonly ordenarPor = signal<OrdenacaoEstoque | null>(null);
  readonly ordemDecrescente = signal(false);

  readonly buscaControl = new FormControl('');

  ngOnInit(): void {
    this.buscaControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pagina.set(1);
      this.carregar();
    });

    this.carregar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erroCarregamento.set(false);
    this.service.listar({
      pagina: this.pagina(),
      tamanhoPagina: this.tamanhoPagina(),
      emEstoque: this.emEstoque() ?? undefined,
      busca: this.buscaControl.value ?? undefined,
      ordenarPor: this.ordenarPor() ?? undefined,
      ordemDecrescente: this.ordemDecrescente(),
    }).subscribe({
      next: (resultado) => {
        this.itens.set(resultado.items);
        this.total.set(resultado.total);
        this.carregando.set(false);
      },
      error: () => {
        this.erroCarregamento.set(true);
        this.carregando.set(false);
      }
    });
  }

  emEstoqueSelectValue(): string {
    const v = this.emEstoque();
    return v === null ? '' : String(v);
  }

  onEmEstoqueChange(value: string): void {
    if (value === 'true') this.emEstoque.set(true);
    else if (value === 'false') this.emEstoque.set(false);
    else this.emEstoque.set(null);
    this.pagina.set(1);
    this.carregar();
  }

  onPaginaChange(event: PageEvent): void {
    this.pagina.set(event.pageIndex + 1);
    this.tamanhoPagina.set(event.pageSize);
    this.carregar();
  }

  editarQuantidade(item: EstoqueDto): void {
    const ref = this.dialog.open(DialogEditarQuantidadeComponent, {
      width: '360px',
      data: { idEstoque: item.id, quantidadeAtual: item.quantidade, nomeProduto: item.produto },
    });
    ref.afterClosed().subscribe((salvo) => {
      if (salvo) this.carregar();
    });
  }

  aoOrdenar(sort: Sort): void {
    if (sort.direction === '') {
      this.ordenarPor.set(null);
      this.ordemDecrescente.set(false);
    } else {
      this.ordenarPor.set(this.colunaParaOrdenacao[sort.active] ?? OrdenacaoEstoque.Produto);
      this.ordemDecrescente.set(sort.direction === 'desc');
    }
    this.pagina.set(1);
    this.carregar();
  }
}
