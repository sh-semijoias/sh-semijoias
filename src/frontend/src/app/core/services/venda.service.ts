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
  idRevendedora?: string;
  nomeCliente?: string;
  nomeProduto?: string;
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

    if (filtros.idRevendedora) params = params.set('idRevendedora', filtros.idRevendedora);
    if (filtros.nomeCliente) params = params.set('nomeCliente', filtros.nomeCliente);
    if (filtros.nomeProduto) params = params.set('nomeProduto', filtros.nomeProduto);
    if (filtros.dataInicio) params = params.set('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params = params.set('dataFim', filtros.dataFim);
    if (filtros.ordenarPor != null) params = params.set('ordenarPor', filtros.ordenarPor);
    if (filtros.ordemDecrescente != null) params = params.set('ordemDecrescente', filtros.ordemDecrescente);

    return this.http.get<ListarVendasResultado>(this.baseUrl, { params });
  }
}
