import { Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ClasseAbc } from '../../../../core/services/dashboard.service';
import { DiasEstoqueService } from '../../dias-estoque.service';
import { CardIndicadorComponent } from '../../components/card-indicador/card-indicador';
import { BarraComponent } from '../../components/barra/barra';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';

// Como no protótipo: a classe C, de giro lento, em cor de alerta (o cinza da classe sumiria no trilho da barra)
const COR_BARRA: Record<ClasseAbc, string> = {
  A: 'var(--cor-classe-a)',
  B: 'var(--cor-classe-b)',
  C: 'var(--cor-alerta)',
};

@Component({
  selector: 'app-card-dias-estoque-detalhe',
  standalone: true,
  imports: [CardIndicadorComponent, BarraComponent, SkeletonComponent, CurrencyPipe, DecimalPipe],
  templateUrl: './dias-estoque-detalhe.html',
  styleUrl: './dias-estoque-detalhe.scss',
})
export class CardDiasEstoqueDetalheComponent {
  private readonly diasEstoqueService = inject(DiasEstoqueService);

  protected readonly diasEstoque = this.diasEstoqueService.diasEstoque;
  protected readonly semVendas = this.diasEstoqueService.semVendas;
  protected readonly dados = computed(() => (this.semVendas() ? undefined : this.diasEstoqueService.dados()));

  // Barras proporcionais ao maior DSI entre as classes
  protected readonly classes = computed(() => {
    const classes = this.dados()?.classes ?? [];
    const maior = Math.max(0, ...classes.map(c => c.diasEstoque ?? 0));
    return classes.map(c => ({ ...c, cor: COR_BARRA[c.classe], percentualBarra: maior === 0 ? 0 : ((c.diasEstoque ?? 0) / maior) * 100 }));
  });
}
