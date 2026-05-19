import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  userId: string;
  email: string;
  name: string;
  role: string;
  precisaTrocarSenha: boolean;
}

export interface TrocarSenhaDto {
  senhaAtual?: string;
  novaSenha: string;
  confirmacaoNovaSenha: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/auth';

  readonly currentUser = signal<LoginResponseDto | null>(null);

  login(dto: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/login`, dto).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => this.currentUser.set(null))
    );
  }

  me(): Observable<LoginResponseDto> {
    return this.http.get<LoginResponseDto>(`${this.baseUrl}/me`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  trocarSenha(dto: TrocarSenhaDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/trocar-senha`, dto).pipe(
      tap(user => this.currentUser.set(user))
    );
  }
}
