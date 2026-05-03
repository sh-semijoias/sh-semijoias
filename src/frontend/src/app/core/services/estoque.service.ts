import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListaPaginada } from './usuario.service';

export interface EstoqueDto {
  id: number;
  idProduto: number;
  produto: string;
  idTipoProduto: number;
  categoria: string;
  quantidade: number;
}

export interface ListarEstoqueFiltros {
  pagina: number;
  tamanhoPagina: number;
  idProduto?: number;
  emEstoque?: boolean;
  busca?: string;
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

    return this.http.get<ListaPaginada<EstoqueDto>>(this.baseUrl, { params });
  }
}
