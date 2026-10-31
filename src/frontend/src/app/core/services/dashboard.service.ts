import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FiltrosSemPeriodo {
  idRevendedora?: string;
  idTipoProduto?: number;
}

export interface FiltrosIndicadores extends FiltrosSemPeriodo {
  dataInicio: string;
  dataFim: string;
}

export interface TicketMedioDto {
  ticketMedio: number;
  quantidadeVendas: number;
  variacaoPercentual: number | null;
}

export interface TicketMedioMesDto {
  ano: number;
  mes: number;
  // Nulo quando o mês não teve vendas
  ticketMedio: number | null;
}

export interface TicketMedioMensalDto {
  meses: TicketMedioMesDto[];
  itensPorVenda: number | null;
}

export type ClasseAbc = 'A' | 'B' | 'C';

export interface ProdutoAbcDto {
  posicao: number;
  descricao: string;
  categoria: string;
  quantidadeVendida: number;
  faturamento: number;
  percentualAcumulado: number;
}

export interface ClasseAbcDto {
  classe: ClasseAbc;
  quantidadeProdutos: number;
  percentualMix: number;
  percentualFaturamento: number;
  faturamento: number;
  // A e B: os 5 de maior faturamento; C: os 5 de menor, do menor para o maior
  produtos: ProdutoAbcDto[];
}

export interface CurvaAbcDto {
  totalProdutos: number;
  faturamento: number;
  // Um ponto por produto, na ordem do ranking; vazio quando não houve faturamento
  percentuaisAcumulados: number[];
  classes: ClasseAbcDto[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/dashboard`;

  obterTicketMedio(filtros: FiltrosIndicadores): Observable<TicketMedioDto> {
    return this.http.get<TicketMedioDto>(`${this.baseUrl}/ticket-medio`, { params: this.params(filtros) });
  }

  obterTicketMedioMensal(filtros: FiltrosSemPeriodo): Observable<TicketMedioMensalDto> {
    return this.http.get<TicketMedioMensalDto>(`${this.baseUrl}/ticket-medio-mensal`, { params: this.params(filtros) });
  }

  obterCurvaAbc(filtros: FiltrosIndicadores): Observable<CurvaAbcDto> {
    return this.http.get<CurvaAbcDto>(`${this.baseUrl}/curva-abc`, { params: this.params(filtros) });
  }

  private params(filtros: FiltrosIndicadores | FiltrosSemPeriodo): HttpParams {
    let params = new HttpParams();

    if ('dataInicio' in filtros) params = params.set('dataInicio', filtros.dataInicio).set('dataFim', filtros.dataFim);
    if (filtros.idRevendedora) params = params.set('idRevendedora', filtros.idRevendedora);
    if (filtros.idTipoProduto != null) params = params.set('idTipoProduto', filtros.idTipoProduto);

    return params;
  }
}
