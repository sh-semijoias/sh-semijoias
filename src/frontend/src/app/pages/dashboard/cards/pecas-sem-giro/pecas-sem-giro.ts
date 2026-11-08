import { Component, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { IdadeEstoqueService } from '../../idade-estoque.service';
import { CardKpiComponent } from '../../components/card-kpi/card-kpi';

@Component({
  selector: 'app-card-pecas-sem-giro',
  standalone: true,
  imports: [CardKpiComponent, CurrencyPipe, DecimalPipe],
  templateUrl: './pecas-sem-giro.html',
})
export class CardPecasSemGiroComponent {
  private readonly idadeEstoqueService = inject(IdadeEstoqueService);

  protected readonly idadeEstoque = this.idadeEstoqueService.idadeEstoque;
  protected readonly dados = this.idadeEstoqueService.dados;
}
