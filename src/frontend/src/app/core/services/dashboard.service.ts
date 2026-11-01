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

export interface MargemBrutaDto {
  percentual: number;
  variacaoPercentual: number | null;
}

export interface DiasEstoqueDto {
  diasEstoque: number;
  diasBase: number;
}

export interface PecasSemGiroDto {
  quantidadePecas: number;
  valorParado: number;
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

  obterMargemBruta(filtros: FiltrosIndicadores): Observable<MargemBrutaDto> {
    return this.http.get<MargemBrutaDto>(`${this.baseUrl}/margem-bruta`, { params: this.params(filtros) });
  }

  obterDiasEstoque(filtros: FiltrosIndicadores): Observable<DiasEstoqueDto> {
  return this.http.get<DiasEstoqueDto>(`${this.baseUrl}/dias-estoque`,{ params: this.params(filtros) });
  }

  obterPecasSemGiro(): Observable<PecasSemGiroDto> {
  return this.http.get<PecasSemGiroDto>(`${this.baseUrl}/pecas-sem-giro`);
  }

  private params(filtros: FiltrosIndicadores | FiltrosSemPeriodo): HttpParams {
    let params = new HttpParams();

    if ('dataInicio' in filtros) params = params.set('dataInicio', filtros.dataInicio).set('dataFim', filtros.dataFim);
    if (filtros.idRevendedora) params = params.set('idRevendedora', filtros.idRevendedora);
    if (filtros.idTipoProduto != null) params = params.set('idTipoProduto', filtros.idTipoProduto);

    return params;
  }
}
