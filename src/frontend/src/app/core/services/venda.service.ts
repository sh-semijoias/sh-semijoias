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
  idCliente?: number;
  idProduto?: number;
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

export interface FormaPagamentoDto {
  id: number;
  descricao: string;
  permiteParcelamento: boolean;
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
    if (filtros.idCliente != null) params = params.set('idCliente', filtros.idCliente);
    if (filtros.idProduto != null) params = params.set('idProduto', filtros.idProduto);
    if (filtros.dataInicio) params = params.set('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params = params.set('dataFim', filtros.dataFim);
    if (filtros.ordenarPor != null) params = params.set('ordenarPor', filtros.ordenarPor);
    if (filtros.ordemDecrescente != null) params = params.set('ordemDecrescente', filtros.ordemDecrescente);

    return this.http.get<ListarVendasResultado>(this.baseUrl, { params });
  }

  listarFormasPagamento(): Observable<FormaPagamentoDto[]> {
    return this.http.get<FormaPagamentoDto[]>(`${this.baseUrl}/formas-pagamento`);
  }
}
