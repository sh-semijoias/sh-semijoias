import { Component, computed, inject, signal } from '@angular/core';
import { CurvaAbcService } from '../../curva-abc.service';
import { DashboardFiltrosService } from '../../dashboard-filtros.service';
import { TemaService } from '../../../../core/services/tema.service';
import { CardIndicadorComponent } from '../../components/card-indicador/card-indicador';
import { GraficoComponent } from '../../graficos/grafico';
import { MenuGraficoComponent } from '../../graficos/menu-grafico';
import { lerPaletaGrafico } from '../../graficos/tema-grafico';
import { SkeletonComponent } from '../../../../shared/components/skeleton/skeleton';
import { descreverCurvaAbc, montarOpcoesCurvaAbc, tabelaCurvaAbc } from './grafico-curva-abc';

@Component({
  selector: 'app-card-curva-abc',
  standalone: true,
  imports: [CardIndicadorComponent, GraficoComponent, MenuGraficoComponent, SkeletonComponent],
  templateUrl: './curva-abc.html',
  styleUrl: './curva-abc.scss',
})
export class CardCurvaAbcComponent {
  private readonly curvaAbcService = inject(CurvaAbcService);
  private readonly filtros = inject(DashboardFiltrosService);
  private readonly tema = inject(TemaService);

  protected readonly curvaAbc = this.curvaAbcService.curvaAbc;
  protected readonly semVendas = this.curvaAbcService.semVendas;
  protected readonly exibirTabela = signal(false);

  // As faixas e anotações usam cores por item, que o tema do ECharts não alcança: relê a paleta ao trocar o tema
  private readonly paleta = computed(() => {
    this.tema.escuro();
    return lerPaletaGrafico();
  });

  protected readonly subtitulo = computed(() =>
    this.filtros.filtros().idTipoProduto === null
      ? 'Todos os produtos, do maior para o menor faturamento · A até 80%, B até 95%, C restante'
      : 'Produtos da categoria, do maior para o menor faturamento · A até 80%, B até 95%, C restante',
  );

  private readonly dados = computed(() => {
    const dados = this.curvaAbc.value();
    return dados && !this.semVendas() ? dados : null;
  });

  protected readonly opcoes = computed(() => {
    const dados = this.dados();
    return dados ? montarOpcoesCurvaAbc(dados, this.paleta()) : {};
  });
  protected readonly descricao = computed(() => {
    const dados = this.dados();
    return dados ? descreverCurvaAbc(dados) : '';
  });
  protected readonly tabela = computed(() => {
    const dados = this.dados();
    return dados ? tabelaCurvaAbc(dados) : { colunas: [], linhas: [] };
  });
}
