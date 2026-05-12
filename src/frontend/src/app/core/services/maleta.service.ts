import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ListaPaginada } from './usuario.service';

export enum OrdenacaoMaleta {
  Descricao = 0,
  DataCadastro = 1,
  DataAtualizacao = 2,
  NomeUsuario = 3,
  TotalProdutos = 4,
  TotalItens = 5,
}

export interface MaletaDto {
  id: number;
  descricao: string;
  nomeUsuario: string;
  totalProdutos: number;
  totalItens: number;
  dataCadastro: string;
  dataAtualizacao: string;
}

export interface ItemMaletaDetalheDto {
  idEstoque: number;
  idProduto: number;
  descricao: string;
  quantidade: number;
  quantidadeGeral: number;
}

export interface MaletaDetalheDto {
  id: number;
  descricao: string;
  idUsuario: string;
  nomeUsuario: string;
  itens: ItemMaletaDetalheDto[];
}

export interface ItemMaletaDto {
  idProduto: number;
  quantidade: number;
}

export interface CriarEditarMaletaDto {
  descricao: string;
  idUsuario: string;
  itens: ItemMaletaDto[];
}

export interface ListarMaletasFiltros {
  pagina: number;
  tamanhoPagina: number;
  busca?: string;
  ordenarPor?: OrdenacaoMaleta;
  ordemDecrescente?: boolean;
}

@Injectable({ providedIn: 'root' })
export class MaletaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/maletas';

  listar(filtros: ListarMaletasFiltros): Observable<ListaPaginada<MaletaDto>> {
    let params = new HttpParams()
      .set('pagina', filtros.pagina)
      .set('tamanhoPagina', filtros.tamanhoPagina);

    if (filtros.busca != null && filtros.busca !== '') params = params.set('busca', filtros.busca);
    if (filtros.ordenarPor != null) params = params.set('ordenarPor', filtros.ordenarPor);
    if (filtros.ordemDecrescente) params = params.set('ordemDecrescente', true);

    return this.http.get<ListaPaginada<MaletaDto>>(this.baseUrl, { params });
  }

  obterPorId(id: number): Observable<MaletaDetalheDto> {
    return this.http.get<MaletaDetalheDto>(`${this.baseUrl}/${id}`);
  }

  criar(dto: CriarEditarMaletaDto): Observable<MaletaDto> {
    return this.http.post<MaletaDto>(this.baseUrl, dto);
  }

  editar(id: number, dto: CriarEditarMaletaDto): Observable<MaletaDto> {
    return this.http.put<MaletaDto>(`${this.baseUrl}/${id}`, dto);
  }

  listarRevendedores(): Observable<{ id: string; nome: string }[]> {
    const params = new HttpParams()
      .set('perfil', 'Revendedor')
      .set('tamanhoPagina', 100)
      .set('pagina', 1);
    return this.http.get<ListaPaginada<{ id: string; nome: string }>>('/api/usuarios', { params }).pipe(
      map(res => res.items)
    );
  }
}
