import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ListaPaginada<T> {
  items: T[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}

export interface UsuarioDto {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  telefone: string | null;
}

export interface CriarUsuarioResponseDto extends UsuarioDto {
  senhaProvisoria: string;
}

export interface CriarUsuarioDto {
  nome: string;
  email: string;
  perfil: string;
  telefone: string;
}

export interface EditarUsuarioDto {
  nome: string;
  perfil: string;
  telefone: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/usuarios';

  listar(pagina = 1, tamanhoPagina = 10): Observable<ListaPaginada<UsuarioDto>> {
    return this.http.get<ListaPaginada<UsuarioDto>>(this.baseUrl, {
      params: { pagina, tamanhoPagina }
    });
  }

  obterPorId(id: string): Observable<UsuarioDto> {
    return this.http.get<UsuarioDto>(`${this.baseUrl}/${id}`);
  }

  criar(dto: CriarUsuarioDto): Observable<CriarUsuarioResponseDto> {
    return this.http.post<CriarUsuarioResponseDto>(this.baseUrl, dto);
  }

  resetarSenhaProvisoria(id: string): Observable<{ senhaProvisoria: string }> {
    return this.http.post<{ senhaProvisoria: string }>(`${this.baseUrl}/${id}/resetar-senha-provisoria`, {});
  }

  editar(id: string, dto: EditarUsuarioDto): Observable<UsuarioDto> {
    return this.http.put<UsuarioDto>(`${this.baseUrl}/${id}`, dto);
  }

  listarRevendedoresPaginado(pagina: number, busca: string): Observable<{ items: { id: string; nome: string }[]; total: number }> {
    const params = new HttpParams()
      .set('perfil', 'Revendedor')
      .set('pagina', pagina)
      .set('tamanhoPagina', 10)
      .set('busca', busca);
    return this.http.get<{ items: { id: string; nome: string }[]; total: number }>(this.baseUrl, { params });
  }
}
