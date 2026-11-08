import { EChartsCoreOption } from 'echarts/core';
import { MargemBrutaDto } from '../../../../core/services/dashboard.service';
import { TabelaGrafico } from '../../graficos/grafico';
import { PaletaGrafico } from '../../graficos/tema-grafico';
import { formatarMoeda, formatarMoedaCurta } from '../../graficos/formatadores';

type TipoPasso = 'total' | 'deducao' | 'resultado';

// Barra da cascata: vai de "baixo" a "alto" no eixo de valores
interface PassoCascata {
  nome: string;
  tipo: TipoPasso;
  valor: number;
  baixo: number;
  alto: number;
}

// Faturamento → − repasse → − CMV → lucro bruto. Cada dedução desce a partir de onde a anterior terminou
export function montarPassosCascata(dados: MargemBrutaDto): PassoCascata[] {
  const aposRepasse = dados.faturamento - dados.repasse;

  return [
    { nome: 'Faturamento', tipo: 'total', valor: dados.faturamento, baixo: 0, alto: dados.faturamento },
    { nome: 'Repasse', tipo: 'deducao', valor: dados.repasse, ...faixa(dados.faturamento, aposRepasse) },
    { nome: 'CMV', tipo: 'deducao', valor: dados.cmv, ...faixa(aposRepasse, dados.lucroBruto) },
    { nome: 'Lucro bruto', tipo: 'resultado', valor: dados.lucroBruto, ...faixa(0, dados.lucroBruto) },
  ];
}

function faixa(a: number, b: number): { baixo: number; alto: number } {
  return { baixo: Math.min(a, b), alto: Math.max(a, b) };
}

// Deduções com sinal de menos, como no protótipo: "− R$ 42.500". Repasse negativo (venda abaixo do preço sugerido) soma
function rotuloValor(passo: PassoCascata, formatar: (valor: number) => string): string {
  if (passo.tipo !== 'deducao') return formatar(passo.valor);
  return passo.valor < 0 ? `+ ${formatar(-passo.valor)}` : `− ${formatar(passo.valor)}`;
}

// Com 2 casas, como o card de margem bruta
const percentualMargem = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// A cascata é montada com barras empilhadas: uma base transparente (do zero até o início da barra) e o trecho visível.
// Prejuízo (lucro negativo) faz barras cruzarem o zero: o trecho acima do zero e o abaixo dele vão em séries separadas,
// empilhadas cada uma no próprio sentido (o ECharts empilha positivos e negativos separadamente)
export function montarOpcoesComposicaoMargem(dados: MargemBrutaDto, paleta: PaletaGrafico): EChartsCoreOption {
  const passos = montarPassosCascata(dados);
  const cor: Record<TipoPasso, string> = { total: paleta.classeB, deducao: paleta.deducao, resultado: paleta.primaria };

  const base = passos.map(p => (p.baixo > 0 ? p.baixo : p.alto < 0 ? p.alto : 0));
  const positivo = passos.map(p => (p.alto > 0 ? p.alto - Math.max(p.baixo, 0) : 0));
  const negativo = passos.map(p => (p.baixo < 0 ? p.baixo - Math.min(p.alto, 0) : 0));

  // O rótulo fica no trecho mais externo da barra: acima do positivo ou abaixo do negativo
  const serieVisivel = (nome: string, valores: number[], acima: boolean) => ({
    name: nome,
    type: 'bar',
    stack: 'cascata',
    barWidth: '56%',
    data: valores.map((valor, i) => ({
      value: valor,
      itemStyle: { color: cor[passos[i].tipo], borderRadius: 2 },
      label: {
        show: acima ? valor > 0 || (valor === 0 && negativo[i] === 0) : valor < 0,
        position: acima ? 'top' : 'bottom',
        formatter: () => rotuloValor(passos[i], formatarMoedaCurta),
        color: paleta.texto,
        fontWeight: 'bold',
      },
    })),
  });

  return {
    // 'same': as margens contam a partir dos rótulos dos eixos, não da linha do eixo
    grid: { left: 4, right: 4, top: 24, bottom: 4, outerBoundsMode: 'same' },
    xAxis: {
      type: 'category',
      data: passos.map(p => p.nome),
      axisTick: { show: false },
      axisLabel: { interval: 0, color: paleta.textoSecundario },
    },
    yAxis: { type: 'value', show: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: { dataIndex: number }[]) => {
        const passo = passos[params[0].dataIndex];
        return `${passo.nome}<br><strong>${rotuloValor(passo, formatarMoeda)}</strong>`;
      },
    },
    series: [
      {
        name: 'Base',
        type: 'bar',
        stack: 'cascata',
        silent: true,
        itemStyle: { color: 'transparent' },
        emphasis: { disabled: true },
        data: base,
      },
      serieVisivel('Acima de zero', positivo, true),
      serieVisivel('Abaixo de zero', negativo, false),
    ],
  };
}

export function descreverComposicaoMargem(dados: MargemBrutaDto): string {
  const resultado = dados.lucroBruto < 0 ? `prejuízo bruto de ${formatarMoeda(-dados.lucroBruto)}` : `lucro bruto de ${formatarMoeda(dados.lucroBruto)}`;
  return (
    `Composição da margem: faturamento de ${formatarMoeda(dados.faturamento)}, ` +
    `menos repasse de ${formatarMoeda(dados.repasse)} ` +
    `e custo das mercadorias vendidas de ${formatarMoeda(dados.cmv)}, ` +
    `resulta em ${resultado}. Margem bruta de ${percentualMargem.format(dados.percentual)}%.`
  );
}

export function tabelaComposicaoMargem(dados: MargemBrutaDto): TabelaGrafico {
  return {
    colunas: ['Etapa', 'Valor'],
    linhas: montarPassosCascata(dados).map(p => [p.nome, rotuloValor(p, formatarMoeda)]),
  };
}
