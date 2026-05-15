import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  criar(dto: CriarUsuarioDto): Observable<UsuarioDto> {
    return this.http.post<UsuarioDto>(this.baseUrl, dto);
  }

  editar(id: string, dto: EditarUsuarioDto): Observable<UsuarioDto> {
    return this.http.put<UsuarioDto>(`${this.baseUrl}/${id}`, dto);
  }

  listarRevendedores(): Observable<{ id: string; nome: string }[]> {
    const params = new HttpParams()
      .set('perfil', 'Revendedor')
      .set('tamanhoPagina', 100)
      .set('pagina', 1);
    return this.http.get<ListaPaginada<{ id: string; nome: string }>>(this.baseUrl, { params }).pipe(
      map(res => res.items)
    );
  }
}
