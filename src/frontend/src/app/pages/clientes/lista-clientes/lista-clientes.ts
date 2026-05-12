import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ClientesDto, ClientesService } from '../../../core/services/clientes.service';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [RouterLink, MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule, MatMenuModule, MatPaginatorModule],
  templateUrl: './lista-clientes.html'
})
export class ListaClientesComponent implements OnInit {
  private readonly service = inject(ClientesService);

  readonly colunas = ['nome', 'email','cpf', 'telefone', 'acoes'];
  readonly clientes = signal<ClientesDto[]>([]);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal(false);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly tamanhoPagina = signal(5);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erroCarregamento.set(false);
    this.service.listar(this.pagina(), this.tamanhoPagina()).subscribe({
      next: (resultado) => {
        
        this.clientes.set(resultado.items);
        this.total.set(resultado.total);
        this.carregando.set(false);
      },
      error: () => { this.erroCarregamento.set(true); this.carregando.set(false); }
    });
  }

  onPaginaChange(event: PageEvent): void {
    this.pagina.set(event.pageIndex + 1);
    this.tamanhoPagina.set(event.pageSize);
    this.carregar();
  }
}
