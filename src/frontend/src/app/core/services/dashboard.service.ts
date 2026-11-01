import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ListaPaginada } from './usuario.service';

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

export type ClasseAbc = 'A' | 'B' | 'C';

// Produto da listagem de uma classe
export interface ProdutoAbcDto {
  // Posição no ranking geral, do maior para o menor faturamento
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
  // No último produto da classe: o ponto de corte na curva. Nulos quando a classe não tem produtos
  percentualProdutosAcumulado: number | null;
  percentualFaturamentoAcumulado: number | null;
}

export interface ListarProdutosAbcFiltros extends FiltrosIndicadores {
  classe: ClasseAbc;
  pagina: number;
  tamanhoPagina: number;
}

// Ponto da curva, na ordem do ranking (posicao 1 = maior faturamento)
export interface PontoCurvaAbcDto {
  posicao: number;
  classe: ClasseAbc;
  percentualProdutos: number;
  percentualFaturamento: number;
}

export interface CurvaAbcDto {
  totalProdutos: number;
  faturamento: number;
  // Com muitos produtos, amostrados (sempre com o último de cada classe); vazio quando não houve faturamento
  pontos: PontoCurvaAbcDto[];
  classes: ClasseAbcDto[];
}

export enum OrdenacaoFaturamentoCliente {
  Faturamento = 0,
  NomeCliente = 1,
  NomeRevendedora = 2,
  QuantidadeVendas = 3,
  DataUltimaCompra = 4,
}

export interface FaturamentoClienteDto {
  // Posição no ranking por faturamento, qualquer que seja a ordenação da listagem
  posicao: number;
  idCliente: number;
  nomeCliente: string;
  idRevendedora: string;
  nomeRevendedora: string;
  quantidadeVendas: number;
  faturamento: number;
  // Sobre o faturamento de todos os clientes no período
  percentualTotal: number;
  // Em relação ao maior faturamento: tamanho da barra
  percentualDoMaior: number;
  // yyyy-MM-dd, dentro do período
  dataUltimaCompra: string;
}

export interface ListarFaturamentoClientesFiltros extends FiltrosIndicadores {
  pagina: number;
  tamanhoPagina: number;
  ordenarPor: OrdenacaoFaturamentoCliente;
  ordemDecrescente: boolean;
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
    return this.http.get<DiasEstoqueDto>(`${this.baseUrl}/dias-estoque`, { params: this.params(filtros) });
  }

  obterPecasSemGiro(): Observable<PecasSemGiroDto> {
    return this.http.get<PecasSemGiroDto>(`${this.baseUrl}/pecas-sem-giro`);
  }

  obterCurvaAbc(filtros: FiltrosIndicadores): Observable<CurvaAbcDto> {
    return this.http.get<CurvaAbcDto>(`${this.baseUrl}/curva-abc`, { params: this.params(filtros) });
  }

  // A e B do maior para o menor faturamento; C do menor para o maior
  listarProdutosAbc(filtros: ListarProdutosAbcFiltros): Observable<ListaPaginada<ProdutoAbcDto>> {
    const params = this.params(filtros)
      .set('classe', filtros.classe)
      .set('pagina', filtros.pagina)
      .set('tamanhoPagina', filtros.tamanhoPagina);
    return this.http.get<ListaPaginada<ProdutoAbcDto>>(`${this.baseUrl}/produtos-abc`, { params });
  }

  listarFaturamentoClientes(filtros: ListarFaturamentoClientesFiltros): Observable<ListaPaginada<FaturamentoClienteDto>> {
    const params = this.params(filtros)
      .set('pagina', filtros.pagina)
      .set('tamanhoPagina', filtros.tamanhoPagina)
      .set('ordenarPor', filtros.ordenarPor)
      .set('ordemDecrescente', filtros.ordemDecrescente);
    return this.http.get<ListaPaginada<FaturamentoClienteDto>>(`${this.baseUrl}/faturamento-clientes`, { params });
  }

  private params(filtros: FiltrosIndicadores | FiltrosSemPeriodo): HttpParams {
    let params = new HttpParams();

    if ('dataInicio' in filtros) params = params.set('dataInicio', filtros.dataInicio).set('dataFim', filtros.dataFim);
    if (filtros.idRevendedora) params = params.set('idRevendedora', filtros.idRevendedora);
    if (filtros.idTipoProduto != null) params = params.set('idTipoProduto', filtros.idTipoProduto);

    return params;
  }
}
