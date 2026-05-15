import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum OrdenacaoVenda {
  DataVenda = 0,
  NomeCliente = 1,
  NomeRevendedora = 2,
  ValorTotal = 3,
}

export interface VendaListagemDto {
  id: number;
  dataVenda: string;
  nomeCliente: string;
  nomeRevendedora: string;
  totalProdutos: number;
  totalItens: number;
  valorTotal: number;
  formaPagamento: string;
}

export interface ListarVendasFiltros {
  pagina: number;
  tamanhoPagina: number;
  idsRevendedores?: string[];
  idsClientes?: number[];
  idsProdutos?: number[];
  dataInicio?: string;
  dataFim?: string;
  ordenarPor?: OrdenacaoVenda;
  ordemDecrescente?: boolean;
}

export interface ListarVendasResultado {
  items: VendaListagemDto[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalVendasPeriodo: number;
}

@Injectable({ providedIn: 'root' })
export class VendaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/vendas';

  listar(filtros: ListarVendasFiltros): Observable<ListarVendasResultado> {
    let params = new HttpParams()
      .set('pagina', filtros.pagina)
      .set('tamanhoPagina', filtros.tamanhoPagina);

    for (const id of filtros.idsRevendedores ?? []) params = params.append('idsRevendedores', id);
    for (const id of filtros.idsClientes ?? []) params = params.append('idsClientes', id);
    for (const id of filtros.idsProdutos ?? []) params = params.append('idsProdutos', id);
    if (filtros.dataInicio) params = params.set('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params = params.set('dataFim', filtros.dataFim);
    if (filtros.ordenarPor != null) params = params.set('ordenarPor', filtros.ordenarPor);
    if (filtros.ordemDecrescente != null) params = params.set('ordemDecrescente', filtros.ordemDecrescente);

    return this.http.get<ListarVendasResultado>(this.baseUrl, { params });
  }
}
