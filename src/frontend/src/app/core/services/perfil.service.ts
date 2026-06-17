import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PerfilDto {
  id: string;
  nome: string;
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);

  listar(): Observable<PerfilDto[]> {
return this.http.get<PerfilDto[]>(
  `${environment.apiUrl}/api/perfis`
);
  }
}
