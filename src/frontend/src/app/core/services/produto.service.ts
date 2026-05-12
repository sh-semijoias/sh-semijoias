import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ListaPaginada<T> {
  items: T[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}

export interface ProdutoDto {
  idProduto: string;
  data: string;
  descricao: string;
  categoria: string;
  precoCompra: number;
  precoVendaSugerido: number;
}

export interface CategoriaProdutoDto {
  id: number;
  descricao: string;
}

export interface CriarProdutoDto {
  data: string;
  descricao: string;
  idCategoria: number;
  precoCompra: number;
  precoVendaSugerido: number;
}

export interface EditarProdutoDto {
  descricao: string;
  idCategoria: number;
  precoCompra: number;
  precoVendaSugerido: number;
}

@Injectable({ providedIn: 'root' })
export class produtoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/produtos';

  listar(pagina = 1, tamanhoPagina = 10): Observable<ListaPaginada<ProdutoDto>> {
    return this.http.get<ListaPaginada<ProdutoDto>>(this.baseUrl, {
      params: { pagina, tamanhoPagina }
    });
  }

  listarCategorias(): Observable<CategoriaProdutoDto[]> {
    return this.http.get<CategoriaProdutoDto[]>(`${this.baseUrl}/categorias`);
  }

  obterPorId(id: string): Observable<ProdutoDto> {
    return this.http.get<ProdutoDto>(`${this.baseUrl}/${id}`);
  }

  criar(dto: CriarProdutoDto): Observable<ProdutoDto> {
    return this.http.post<ProdutoDto>(this.baseUrl, dto);
  }

  editar(id: string, dto: EditarProdutoDto): Observable<ProdutoDto> {
    return this.http.put<ProdutoDto>(`${this.baseUrl}/${id}`, dto);
  }
}
