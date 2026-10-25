import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';

@Component({
  selector: 'app-card-indicador',
  standalone: true,
  imports: [MatCardModule, MatIconModule, MatTooltipModule, SkeletonComponent],
  templateUrl: './card-indicador.html',
  styleUrl: './card-indicador.scss',
})
export class CardIndicadorComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>();
  readonly ajuda = input<string>();
  readonly etiqueta = input<string>();
  // Avisa no tooltip de ajuda
  readonly naoSegueFiltroPeriodo = input(false);
  readonly carregando = input(false);
  readonly erro = input(false);
  readonly vazio = input(false);
  readonly mensagemVazio = input('Nenhum dado no período.');

  protected readonly textoAjuda = computed(() =>
    [this.naoSegueFiltroPeriodo() ? 'Não segue o filtro de período.' : '', this.ajuda() ?? '']
      .filter(Boolean)
      .join(' '),
  );
}
