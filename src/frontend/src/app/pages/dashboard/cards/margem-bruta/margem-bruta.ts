import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MargemBrutaService } from '../../margem-bruta.service';
import { CardKpiComponent } from '../../components/card-kpi/card-kpi';
import { VariacaoComponent } from '../../components/variacao/variacao';

@Component({
  selector: 'app-card-margem-bruta',
  standalone: true,
  imports: [CardKpiComponent, VariacaoComponent, DecimalPipe],
  templateUrl: './margem-bruta.html',
})
export class CardMargemBrutaComponent {
  private readonly margemBrutaService = inject(MargemBrutaService);

  protected readonly margemBruta = this.margemBrutaService.margemBruta;
  protected readonly dados = this.margemBrutaService.dados;
}
