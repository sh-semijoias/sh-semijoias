import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { IdadeEstoqueService } from '../../idade-estoque.service';
import { CardIndicadorComponent } from '../../components/card-indicador/card-indicador';
import { BarraComponent } from '../../components/barra/barra';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';

@Component({
  selector: 'app-card-idade-estoque',
  standalone: true,
  imports: [CardIndicadorComponent, BarraComponent, SkeletonComponent, CurrencyPipe, DecimalPipe],
  templateUrl: './idade-estoque.html',
  styleUrl: './idade-estoque.scss',
})
export class CardIdadeEstoqueComponent {
  private readonly idadeEstoqueService = inject(IdadeEstoqueService);

  protected readonly idadeEstoque = this.idadeEstoqueService.idadeEstoque;
  protected readonly semEstoque = this.idadeEstoqueService.semEstoque;

  // Barras proporcionais à faixa com mais peças; cor pela faixa (variáveis --cor-idade-* do styles.scss)
  protected readonly faixas = computed(() => {
    const faixas = this.semEstoque() ? [] : (this.idadeEstoqueService.dados()?.faixas ?? []);
    const maior = Math.max(0, ...faixas.map(f => f.quantidade));
    return faixas.map(f => ({
      ...f,
      cor: `var(--cor-idade-${f.codigo})`,
      percentualBarra: maior === 0 ? 0 : (f.quantidade / maior) * 100,
    }));
  });

  // Seis linhas de faixa no esqueleto
  protected readonly linhasEsqueleto = [1, 2, 3, 4, 5, 6];
}
