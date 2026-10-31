import { EChartsCoreOption } from 'echarts/core';
import { ClasseAbc, CurvaAbcDto } from '../../../../core/services/dashboard.service';
import { TabelaGrafico } from '../../graficos/grafico';
import { PaletaGrafico } from '../../graficos/tema-grafico';
import { formatarMoeda, formatarPercentual, formatarPercentualInteiro } from '../../graficos/formatadores';

const LIMITES_CLASSES = [80, 95];
const OPACIDADE_FAIXA = 0.18;

// Abaixo desta largura do gráfico (px), os rótulos encurtam
const LARGURA_COMPACTA = 480;
// Estimativas para posicionar os rótulos dos cortes sem medir o texto: a área de plotagem desconta
// o eixo vertical e as margens, e cada caractere dos rótulos ocupa no máximo isto
const MARGEM_PLOTAGEM = 52;
const LARGURA_CARACTERE = 6.5;
const DISTANCIA_ROTULO = 14;

interface FaixaClasse {
  classe: ClasseAbc;
  // Posição no eixo horizontal (% dos produtos) do primeiro e do último produto da classe
  inicio: number;
  fim: number;
}

// Faixas das classes no eixo horizontal. Classe sem produtos (corte nulo) não tem faixa, e a seguinte começa onde a anterior terminou
function faixasClasses(dados: CurvaAbcDto): FaixaClasse[] {
  let inicio = 0;

  return dados.classes.flatMap(({ classe, percentualProdutosAcumulado: fim }) => {
    if (fim === null) return [];
    const faixa = { classe, inicio, fim };
    inicio = fim;
    return [faixa];
  });
}

// Pontos de corte das classes A e B: o último produto da classe, exatamente sobre a curva; classe sem produtos não tem corte
function cortes(dados: CurvaAbcDto): { classe: ClasseAbc; produtos: number; faturamento: number }[] {
  return dados.classes.flatMap(({ classe, percentualProdutosAcumulado: produtos, percentualFaturamentoAcumulado: faturamento }) =>
    classe === 'C' || produtos === null || faturamento === null ? [] : [{ classe, produtos, faturamento }],
  );
}

// largura: do gráfico em px, para encurtar e posicionar os rótulos
export function montarOpcoesCurvaAbc(dados: CurvaAbcDto, paleta: PaletaGrafico, largura: number): EChartsCoreOption {
  const compacto = largura < LARGURA_COMPACTA;
  const larguraPlotagem = largura - MARGEM_PLOTAGEM;
  // Com muitos produtos, os pontos vêm amostrados da API; a curva começa na origem
  const pontos = [[0, 0], ...dados.pontos.map(ponto => [ponto.percentualProdutos, ponto.percentualFaturamento])];
  const corClasse: Record<ClasseAbc, string> = { A: paleta.classeA, B: paleta.classeB, C: paleta.classeC };
  const eixoPercentual = {
    type: 'value',
    min: 0,
    max: 100,
    interval: 25,
    axisLabel: { formatter: formatarPercentualInteiro },
  };

  return {
    // 'all': as margens contam a partir dos rótulos e do nome dos eixos
    grid: { left: 4, right: 12, top: 12, bottom: 4, outerBoundsMode: 'same', outerBoundsContain: 'all' },
    xAxis: {
      ...eixoPercentual,
      splitLine: { show: false },
      name: compacto ? '% dos produtos' : '% dos produtos, do maior para o menor faturamento',
      nameLocation: 'middle',
      nameGap: 28,
    },
    yAxis: eixoPercentual,
    tooltip: {
      trigger: 'axis',
      formatter: (params: { dataIndex: number }[]) => {
        const indice = params[0].dataIndex;
        if (indice === 0) return '';
        const ponto = dados.pontos[indice - 1];
        return (
          `Produto #${ponto.posicao} de ${dados.totalProdutos} · Classe ${ponto.classe}<br>` +
          `${formatarPercentualInteiro(ponto.percentualProdutos)} dos produtos<br>` +
          `<strong>${formatarPercentual(ponto.percentualFaturamento)} do faturamento</strong>`
        );
      },
    },
    series: [
      {
        name: '% acumulado do faturamento',
        type: 'line',
        data: pontos,
        showSymbol: false,
        // Com poucos produtos, cada ponto vira um trecho reto visível. A suavização passa pelos mesmos pontos,
        // então os cortes continuam sobre a curva. Sem smoothMonotone: os modos monótonos achatam a curva em
        // cada ponto e a deixam em degraus.
        smooth: true,
        lineStyle: { color: paleta.terciaria },
        itemStyle: { color: paleta.terciaria },
        markArea: {
          silent: true,
          data: faixasClasses(dados).map(faixa => [
            {
              xAxis: faixa.inicio,
              itemStyle: { color: corClasse[faixa.classe], opacity: OPACIDADE_FAIXA },
              // Na base: no topo, a letra disputa espaço com a curva e com o rótulo da linha de 95%
              label: { show: true, position: 'insideBottom', formatter: faixa.classe, color: paleta.textoSecundario, fontWeight: 'bold' },
            },
            { xAxis: faixa.fim },
          ]),
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { type: 'dashed', width: 1, color: paleta.terciaria },
          label: { position: 'insideStartTop', formatter: '{c}%', color: paleta.terciaria },
          data: LIMITES_CLASSES.map(limite => ({ yAxis: limite })),
        },
        markPoint: {
          silent: true,
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: { color: paleta.superficie, borderColor: paleta.terciaria, borderWidth: 2 },
          data: cortes(dados).map(corte => {
            const [titulo, detalhe] = compacto
              ? [`${corte.classe}: ${formatarPercentualInteiro(corte.produtos)} dos itens`, `→ ${formatarPercentual(corte.faturamento)} do fat.`]
              : [`${corte.classe}: ${formatarPercentualInteiro(corte.produtos)} dos produtos`, `→ ${formatarPercentual(corte.faturamento)} do faturamento`];
            const larguraRotulo = Math.max(titulo.length, detalhe.length) * LARGURA_CARACTERE;
            // Se não couber à direita do ponto, encosta na borda direita do gráfico, ainda abaixo da curva
            const deslocamento = Math.min(DISTANCIA_ROTULO, larguraPlotagem - (corte.produtos / 100) * larguraPlotagem - larguraRotulo);

            return {
              coord: [corte.produtos, corte.faturamento],
              label: {
                show: true,
                // Abaixo e à direita do ponto, onde a curva (côncava) não passa
                position: [deslocamento, 6],
                align: 'left',
                formatter: `{titulo|${titulo}}\n{detalhe|${detalhe}}`,
                rich: {
                  titulo: { color: paleta.texto, fontWeight: 'bold', fontSize: 12, lineHeight: 16 },
                  detalhe: { color: paleta.textoSecundario, fontSize: 11, lineHeight: 16 },
                },
              },
            };
          }),
        },
      },
    ],
  };
}

export function descreverCurvaAbc(dados: CurvaAbcDto): string {
  const partes = [`Curva ABC de ${dados.totalProdutos} produtos, do maior para o menor faturamento.`];

  for (const classe of dados.classes) {
    partes.push(
      classe.quantidadeProdutos === 0
        ? `Classe ${classe.classe}: nenhum produto.`
        : `Classe ${classe.classe}: ${quantidadeProdutos(classe.quantidadeProdutos)} ` +
            `(${formatarPercentual(classe.percentualMix)} do mix), ` +
            `${formatarPercentual(classe.percentualFaturamento)} do faturamento.`,
    );
  }

  return partes.join(' ');
}

export function tabelaCurvaAbc(dados: CurvaAbcDto): TabelaGrafico {
  return {
    colunas: ['Classe', 'Produtos', '% do mix', '% do faturamento', 'Faturamento'],
    linhas: dados.classes.map(classe => [
      `Classe ${classe.classe}`,
      String(classe.quantidadeProdutos),
      formatarPercentual(classe.percentualMix),
      formatarPercentual(classe.percentualFaturamento),
      formatarMoeda(classe.faturamento),
    ]),
  };
}

function quantidadeProdutos(quantidade: number): string {
  return quantidade === 1 ? '1 produto' : `${quantidade} produtos`;
}
