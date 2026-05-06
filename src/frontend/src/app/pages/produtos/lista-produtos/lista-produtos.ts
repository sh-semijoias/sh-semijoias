import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CategoriaProdutoDto, ProdutoDto, produtoService } from '../../../core/services/produto.service';

@Component({
  selector: 'app-lista-produtos',
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
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './lista-produtos.html'
})
export class ListaProdutosComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(produtoService);

  readonly colunas = ['data', 'descricao', 'categoria', 'precoCompra', 'precoVendaSugerido', 'acoes'];
  readonly produtos = signal<ProdutoDto[]>([]);
  readonly produtosFiltrados = signal<ProdutoDto[]>([]);
  readonly categorias = signal<CategoriaProdutoDto[]>([]);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal(false);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly tamanhoPagina = signal(10);

  readonly filtros = this.fb.group({
    busca: [''],
    categoria: ['']
  });

  ngOnInit(): void {
    this.carregarCategorias();
    this.filtros.valueChanges.subscribe(() => this.aplicarFiltros());
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erroCarregamento.set(false);
    this.service.listar(this.pagina(), this.tamanhoPagina()).subscribe({
      next: (resultado) => {
        this.produtos.set(resultado.items);
        this.aplicarFiltros();
        this.total.set(resultado.total);
        this.carregando.set(false);
      },
      error: () => { this.erroCarregamento.set(true); this.carregando.set(false); }
    });
  }

  carregarCategorias(): void {
    this.service.listarCategorias().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: () => this.categorias.set([])
    });
  }

  onPaginaChange(event: PageEvent): void {
    this.pagina.set(event.pageIndex + 1);
    this.tamanhoPagina.set(event.pageSize);
    this.carregar();
  }

  aplicarFiltros(): void {
    const { busca, categoria } = this.filtros.getRawValue();
    const termoBusca = (busca ?? '').trim().toLowerCase();
    const categoriaSelecionada = (categoria ?? '').trim().toLowerCase();

    const filtrados = this.produtos().filter((produto) => {
      const matchesSearch = !termoBusca || produto.descricao.toLowerCase().includes(termoBusca);
      const matchesCategory = !categoriaSelecionada || produto.categoria.toLowerCase() === categoriaSelecionada;
      return matchesSearch && matchesCategory;
    });

    this.produtosFiltrados.set(filtrados);
  }
}
