import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TemaService } from '../../../../core/services/tema.service';
import { MargemBrutaService } from '../../margem-bruta.service';
import { CardIndicadorComponent } from '../../components/card-indicador/card-indicador';
import { GraficoComponent } from '../../graficos/grafico';
import { MenuGraficoComponent } from '../../graficos/menu-grafico';
import { lerPaletaGrafico } from '../../graficos/tema-grafico';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';
import { descreverComposicaoMargem, montarOpcoesComposicaoMargem, tabelaComposicaoMargem } from './grafico-composicao-margem';

@Component({
  selector: 'app-card-composicao-margem',
  standalone: true,
  imports: [CardIndicadorComponent, GraficoComponent, MenuGraficoComponent, SkeletonComponent, DecimalPipe],
  templateUrl: './composicao-margem.html',
})
export class CardComposicaoMargemComponent {
  private readonly margemBrutaService = inject(MargemBrutaService);
  private readonly tema = inject(TemaService);

  protected readonly margemBruta = this.margemBrutaService.margemBruta;
  protected readonly semVendas = this.margemBrutaService.semVendas;
  protected readonly exibirTabela = signal(false);

  // As barras usam cores por item, que o tema do ECharts não alcança: relê a paleta ao trocar o tema
  private readonly paleta = computed(() => {
    this.tema.escuro();
    return lerPaletaGrafico();
  });

  protected readonly dados = computed(() => (this.semVendas() ? undefined : this.margemBrutaService.dados()));

  protected readonly opcoes = computed(() => {
    const dados = this.dados();
    return dados ? montarOpcoesComposicaoMargem(dados, this.paleta()) : {};
  });

  protected readonly descricao = computed(() => {
    const dados = this.dados();
    return dados ? descreverComposicaoMargem(dados) : '';
  });

  protected readonly tabela = computed(() => {
    const dados = this.dados();
    return dados ? tabelaComposicaoMargem(dados) : { colunas: [], linhas: [] };
  });
}
