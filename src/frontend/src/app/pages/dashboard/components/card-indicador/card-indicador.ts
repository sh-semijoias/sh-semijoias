import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-card-indicador',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule],
  templateUrl: './card-indicador.html',
})
export class CardIndicadorComponent {
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>();
  readonly etiqueta = input<string>();
  readonly naoSegueFiltroPeriodo = input(false);
  readonly carregando = input(false);
  readonly erro = input(false);
  readonly vazio = input(false);
}
