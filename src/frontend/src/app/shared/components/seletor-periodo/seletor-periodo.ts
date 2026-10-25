import { Component, computed, inject, model, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  DateRange,
  DefaultMatCalendarRangeStrategy,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { map } from 'rxjs/operators';
import { ATALHOS_PERIODO, AtalhoPeriodo, Periodo, calcularAtalho, formatarData, rotuloPeriodo } from './periodo';

@Component({
  selector: 'app-seletor-periodo',
  standalone: true,
  imports: [OverlayModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatDatepickerModule],
  providers: [{ provide: MAT_DATE_RANGE_SELECTION_STRATEGY, useClass: DefaultMatCalendarRangeStrategy }],
  templateUrl: './seletor-periodo.html',
  styleUrl: './seletor-periodo.scss',
})
export class SeletorPeriodoComponent {
  readonly periodo = model.required<Periodo>();

  protected readonly atalhos = ATALHOS_PERIODO;
  protected readonly hoje = new Date();
  protected readonly aberto = signal(false);
  protected readonly rascunho = signal(new DateRange<Date>(null, null));
  protected readonly rotulo = computed(() => rotuloPeriodo(this.periodo()));
  protected readonly rotuloAcessivel = computed(() => {
    const { atalho, datas } = this.rotulo();
    return atalho ? `${atalho}, ${datas}` : datas;
  });
  protected readonly rotuloRascunho = computed(() => {
    const { start, end } = this.rascunho();
    return start ? `${formatarData(start)} – ${end ? formatarData(end) : '...'}` : '';
  });

  protected readonly isMobile = toSignal(
    inject(BreakpointObserver).observe('(max-width: 599.98px)').pipe(map(estado => estado.matches)),
    { initialValue: false },
  );

  protected abrir(): void {
    const periodo = this.periodo();
    this.rascunho.set(new DateRange(periodo.inicio, periodo.fim));
    this.aberto.set(true);
  }

  protected fechar(): void {
    this.aberto.set(false);
  }

  protected aplicarAtalho(atalho: AtalhoPeriodo): void {
    this.periodo.set(calcularAtalho(atalho));
    this.fechar();
  }

  protected selecionarData(data: Date | null): void {
    if (!data) return;

    const { start, end } = this.rascunho();
    if (!start || end) {
      this.rascunho.set(new DateRange(data, null));
    } else if (data < start) {
      this.rascunho.set(new DateRange(data, start));
    } else {
      this.rascunho.set(new DateRange(start, data));
    }
  }

  protected aplicar(): void {
    const { start, end } = this.rascunho();
    if (!start || !end) return;

    this.periodo.set({ inicio: start, fim: end, atalho: null });
    this.fechar();
  }

  protected aoTeclar(evento: KeyboardEvent): void {
    if (evento.key === 'Escape') this.fechar();
  }
}
