import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ProdutoDto, produtoService } from '../../../core/services/produto.service';

@Component({
  selector: 'app-lista-produtos',
  standalone: true,
  imports: [RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule, MatMenuModule, MatPaginatorModule],
  templateUrl: './lista-produtos.html'
})
export class ListaProdutosComponent implements OnInit {
  private readonly service = inject(produtoService);

  readonly colunas = ['data', 'descricao', 'tipo', 'precoCompra', 'precoVendaSugerido'];
  readonly produtos = signal<ProdutoDto[]>([]);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal(false);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly tamanhoPagina = signal(10);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erroCarregamento.set(false);
    this.service.listar(this.pagina(), this.tamanhoPagina()).subscribe({
      next: (resultado) => {
        this.produtos.set(resultado.items);
        this.total.set(resultado.total);
        this.carregando.set(false);
      },
      error: () => { this.erroCarregamento.set(true); this.carregando.set(false); }
    });
  }

  onPaginaChange(event: PageEvent): void {
    this.pagina.set(event.pageIndex + 1);
    this.tamanhoPagina.set(event.pageSize);
    this.carregar();
  }
}
