import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { UsuarioDto, UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, DecimalPipe],
  templateUrl: './lista-usuarios.html'
})
export class ListaUsuariosComponent implements OnInit {
  private readonly service = inject(UsuarioService);

  readonly colunas = ['nome', 'email', 'perfil', 'comissao', 'acoes'];
  readonly usuarios = signal<UsuarioDto[]>([]);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal(false);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erroCarregamento.set(false);
    this.service.listar().subscribe({
      next: (lista) => { this.usuarios.set(lista); this.carregando.set(false); },
      error: () => { this.erroCarregamento.set(true); this.carregando.set(false); }
    });
  }
}
