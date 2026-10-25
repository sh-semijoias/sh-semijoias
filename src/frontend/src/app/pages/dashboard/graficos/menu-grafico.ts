import { Component, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

// Menu de opções do gráfico no cabeçalho do card (slot "acoes" do app-card-indicador)
@Component({
  selector: 'app-menu-grafico',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <button matIconButton type="button" class="compacto" aria-label="Opções do gráfico" [matMenuTriggerFor]="menu">
      <mat-icon>more_vert</mat-icon>
    </button>
    <mat-menu #menu="matMenu" xPosition="before">
      <button mat-menu-item type="button" (click)="exibirTabela.set(!exibirTabela())">
        <mat-icon>{{ exibirTabela() ? 'show_chart' : 'table_rows' }}</mat-icon>
        <span>{{ exibirTabela() ? 'Ver como gráfico' : 'Ver como tabela' }}</span>
      </button>
    </mat-menu>
  `,
  styles: `
    // Margens negativas: o botão compacto não aumenta a altura do cabeçalho e o ícone alinha à borda do card
    :host {
      display: flex;
      margin: -0.25rem -0.25rem -0.25rem 0;
    }

    // Só o botão encolhe; o Material calcula o padding a partir do ícone (24px) e o mantém centralizado
    .compacto {
      --mat-icon-button-state-layer-size: 2rem;
    }
  `,
})
export class MenuGraficoComponent {
  readonly exibirTabela = model(false);
}
