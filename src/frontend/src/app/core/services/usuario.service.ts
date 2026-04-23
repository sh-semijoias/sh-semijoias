import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UsuarioDto {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  percentualComissao: number | null;
}

export interface CriarUsuarioDto {
  nome: string;
  email: string;
  perfil: string;
  percentualComissao: number | null;
}

export interface EditarUsuarioDto {
  nome: string;
  perfil: string;
  percentualComissao: number | null;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/usuarios';

  listar(): Observable<UsuarioDto[]> {
    return this.http.get<UsuarioDto[]>(this.baseUrl);
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
}
