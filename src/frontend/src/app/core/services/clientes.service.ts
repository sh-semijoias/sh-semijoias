import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ListaPaginada<T> {
  items: T[];
  total: number;
  pagina: number;
  tamanhoPagina: number;
}

export interface ClientesDto {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
}

export interface CriarclientesDto {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
}

export interface EditarclientesDto {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
}

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
private readonly baseUrl =
  `${environment.apiUrl}/api/clientes`;

  listar(pagina = 1, tamanhoPagina = 10, busca?: string): Observable<ListaPaginada<ClientesDto>> {
    let params = new HttpParams().set('pagina', pagina).set('tamanhoPagina', tamanhoPagina);
    if (busca) params = params.set('busca', busca);
    return this.http.get<ListaPaginada<ClientesDto>>(this.baseUrl, { params });
  }

  obterPorId(id: string): Observable<ClientesDto> {
    return this.http.get<ClientesDto>(`${this.baseUrl}/${id}`);
  }

  criar(dto: CriarclientesDto): Observable<ClientesDto> {
   return this.http.post<ClientesDto>(this.baseUrl, dto);
  }

  editar(id: string, dto: EditarclientesDto): Observable<ClientesDto> {
    return this.http.put<ClientesDto>(`${this.baseUrl}/${id}`, dto);
  }
}
