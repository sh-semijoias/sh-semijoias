import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { EstoqueDto, EstoqueService } from '../../../core/services/estoque.service';

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
  ],
  templateUrl: './lista-estoque.html'
})
export class ListaEstoqueComponent implements OnInit, OnDestroy {
  private readonly service = inject(EstoqueService);
  private readonly destroy$ = new Subject<void>();

  readonly colunas = ['produto', 'categoria', 'quantidade', 'acoes'];
  readonly itens = signal<EstoqueDto[]>([]);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal(false);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly tamanhoPagina = signal(10);

  readonly emEstoque = signal<boolean | null>(null);

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
}
