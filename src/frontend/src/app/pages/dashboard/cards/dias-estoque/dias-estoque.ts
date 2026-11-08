import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DiasEstoqueService } from '../../dias-estoque.service';
import { CardKpiComponent } from '../../components/card-kpi/card-kpi';

@Component({
  selector: 'app-card-dias-estoque',
  standalone: true,
  imports: [CardKpiComponent, DecimalPipe],
  templateUrl: './dias-estoque.html',
})
export class CardDiasEstoqueComponent {
  private readonly diasEstoqueService = inject(DiasEstoqueService);

  protected readonly diasEstoque = this.diasEstoqueService.diasEstoque;
  protected readonly dados = this.diasEstoqueService.dados;
}
