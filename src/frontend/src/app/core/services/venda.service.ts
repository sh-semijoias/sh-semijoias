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
  idUsuario: string;
  nomeRevendedora: string;
  totalItens: number;
  totalParcelas: number;
  valorTotal: number;
  valorRecebido: number;
  formaPagamento: string;
  dataCancelamento: string | null;
  nomeMotivoCancelamento: string | null;
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
  cancelada?: boolean | null;
}

export interface MotivoCancelamentoDto {
  id: number;
  nome: string;
}

export interface CancelarVendaDto {
  idMotivoCancelamentoVenda: number;
}

export interface ListarVendasResultado {
  items: VendaListagemDto[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
  totalVendasPeriodo: number;
  totalRecebidoPeriodo: number;
  totalLucroPrevistoPeriodo: number;
  totalLucroRealizadoPeriodo: number;
  totalRepassePrevistoPeriodo: number;
  totalRepasseRealizadoPeriodo: number;
}

export interface ParcelaVendaDto {
  id: number;
  numeroParcela: number;
  valor: number;
  dataVencimento: string;
  paga: boolean;
  dataRecebimento: string | null;
}

export interface RegistrarPagamentoDto {
  idParcela: number;
  dataPagamento: string;
}

export interface FormaPagamentoDto {
  id: number;
  descricao: string;
  permiteParcelamento: boolean;
}

export interface ItemVendaDto {
  idEstoque: number;
  quantidade: number;
  precoVendaReal: number;
}

export interface CriarVendaDto {
  idCliente: number;
  idTipoPagamento: number;
  totalParcelas: number;
  comentario?: string;
  itens: ItemVendaDto[];
}

export interface VendaCriadaDto {
  id: number;
  dataVenda: string;
  valorTotal: number;
  totalParcelas: number;
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
    if (filtros.cancelada != null) params = params.set('cancelada', filtros.cancelada);

    return this.http.get<ListarVendasResultado>(this.baseUrl, { params });
  }

  listarFormasPagamento(): Observable<FormaPagamentoDto[]> {
    return this.http.get<FormaPagamentoDto[]>(`${this.baseUrl}/formas-pagamento`);
  }

  criar(dto: CriarVendaDto): Observable<VendaCriadaDto> {
    return this.http.post<VendaCriadaDto>(this.baseUrl, dto);
  }

  listarMotivosCancelamento(): Observable<MotivoCancelamentoDto[]> {
    return this.http.get<MotivoCancelamentoDto[]>(`${this.baseUrl}/motivos-cancelamento`);
  }

  cancelar(id: number, dto: CancelarVendaDto): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { body: dto });
  }

  listarParcelas(idVenda: number): Observable<ParcelaVendaDto[]> {
    return this.http.get<ParcelaVendaDto[]>(`${this.baseUrl}/${idVenda}/parcelas`);
  }

  registrarPagamento(idVenda: number, dto: RegistrarPagamentoDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${idVenda}/parcelas/pagamento`, dto);
  }
}
