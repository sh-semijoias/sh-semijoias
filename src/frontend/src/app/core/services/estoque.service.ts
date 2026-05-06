import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListaPaginada } from './usuario.service';

export enum OrdenacaoEstoque {
  Produto = 0,
  Categoria = 1,
  Quantidade = 2,
  PrecoCompra = 3,
  PrecoVendaSugerido = 4,
}

export interface EstoqueDto {
  id: number;
  idProduto: number;
  produto: string;
  idTipoProduto: number;
  categoria: string;
  quantidade: number;
  precoCompra: number;
  precoVendaSugerido: number;
}

export interface ListarEstoqueFiltros {
  pagina: number;
  tamanhoPagina: number;
  idProduto?: number;
  emEstoque?: boolean;
  busca?: string;
  ordenarPor?: OrdenacaoEstoque;
  ordemDecrescente?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EstoqueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/estoque';

  listar(filtros: ListarEstoqueFiltros): Observable<ListaPaginada<EstoqueDto>> {
    let params = new HttpParams()
      .set('pagina', filtros.pagina)
      .set('tamanhoPagina', filtros.tamanhoPagina);

    if (filtros.idProduto != null) params = params.set('idProduto', filtros.idProduto);
    if (filtros.emEstoque != null) params = params.set('emEstoque', filtros.emEstoque);
    if (filtros.busca != null && filtros.busca !== '') params = params.set('busca', filtros.busca);
    if (filtros.ordenarPor != null) params = params.set('ordenarPor', filtros.ordenarPor);
    if (filtros.ordemDecrescente) params = params.set('ordemDecrescente', true);

    return this.http.get<ListaPaginada<EstoqueDto>>(this.baseUrl, { params });
  }
}
