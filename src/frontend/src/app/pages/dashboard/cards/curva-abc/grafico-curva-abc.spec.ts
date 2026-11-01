import { describe, expect, it } from 'vitest';
import { ClasseAbc, ClasseAbcDto, CurvaAbcDto, PontoCurvaAbcDto } from '../../../../core/services/dashboard.service';
import { PaletaGrafico } from '../../graficos/tema-grafico';
import { descreverCurvaAbc, montarOpcoesCurvaAbc, tabelaCurvaAbc } from './grafico-curva-abc';

const paleta: PaletaGrafico = {
  primaria: 'primaria',
  terciaria: 'terciaria',
  superficie: 'superficie',
  classeA: 'cor-a',
  classeB: 'cor-b',
  classeC: 'cor-c',
  texto: 'texto',
  textoSecundario: 'texto-secundario',
  contorno: 'contorno',
  grade: 'grade',
  fundoTooltip: 'fundo-tooltip',
  textoTooltip: 'texto-tooltip',
  fonte: 'fonte',
};

// corte: % dos produtos e % do faturamento no último produto da classe; nulo na classe sem produtos
function classe(
  nome: ClasseAbc,
  quantidadeProdutos: number,
  percentualMix: number,
  percentualFaturamento: number,
  faturamento: number,
  corte: [number, number] | null,
): ClasseAbcDto {
  const [percentualProdutosAcumulado, percentualFaturamentoAcumulado] = corte ?? [null, null];
  return {
    classe: nome,
    quantidadeProdutos,
    percentualMix,
    percentualFaturamento,
    faturamento,
    percentualProdutosAcumulado,
    percentualFaturamentoAcumulado,
  };
}

// Um ponto por produto (curva sem amostragem), com a classe de cada posição
function pontos(acumulados: number[], classes: ClasseAbc[]): PontoCurvaAbcDto[] {
  return acumulados.map((percentualFaturamento, i) => ({
    posicao: i + 1,
    classe: classes[i],
    percentualProdutos: ((i + 1) / acumulados.length) * 100,
    percentualFaturamento,
  }));
}

// 10 produtos: 2 em A (até 82%), 3 em B (até 96%), 5 em C (2 deles sem vendas)
const dez: CurvaAbcDto = {
  totalProdutos: 10,
  faturamento: 1000,
  pontos: pontos([50, 82, 88, 92, 96, 98, 99, 100, 100, 100], ['A', 'A', 'B', 'B', 'B', 'C', 'C', 'C', 'C', 'C']),
  classes: [classe('A', 2, 20, 82, 820, [20, 82]), classe('B', 3, 30, 14, 140, [50, 96]), classe('C', 5, 50, 4, 40, [100, 100])],
};

// O Intl separa "R$" do valor com espaço não separável
const texto = (valor: string) => valor.replace(/ /g, ' ');

interface SerieCurva {
  data: number[][];
  markArea: { data: [{ xAxis: number; itemStyle: { color: string }; label: { formatter: string } }, { xAxis: number }][] };
  markLine: { data: { yAxis: number }[] };
  markPoint: { data: RotuloCorte[] };
}

const LARGO = 800;
const ESTREITO = 300;

interface RotuloCorte {
  coord: number[];
  label: { formatter: string; position: number[] };
}

const serie = (dados: CurvaAbcDto, largura = LARGO) =>
  (montarOpcoesCurvaAbc(dados, paleta, largura) as { series: SerieCurva[] }).series[0];

describe('montarOpcoesCurvaAbc', () => {
  it('começa a curva na origem e segue os pontos da API', () => {
    const pontos = serie(dez).data;

    expect(pontos).toHaveLength(11);
    expect(pontos[0]).toEqual([0, 0]);
    expect(pontos[2]).toEqual([20, 82]);
    expect(pontos[10]).toEqual([100, 100]);
  });

  it('destaca a faixa de cada classe com a sua cor', () => {
    const faixas = serie(dez).markArea.data.map(([inicio, fim]) => [inicio.label.formatter, inicio.xAxis, fim.xAxis, inicio.itemStyle.color]);

    expect(faixas).toEqual([
      ['A', 0, 20, 'cor-a'],
      ['B', 20, 50, 'cor-b'],
      ['C', 50, 100, 'cor-c'],
    ]);
  });

  it('traça as linhas de referência em 80% e 95%', () => {
    expect(serie(dez).markLine.data).toEqual([{ yAxis: 80 }, { yAxis: 95 }]);
  });

  it('anota os cortes de A e B sobre o último produto de cada classe', () => {
    const cortes = serie(dez).markPoint.data;

    expect(cortes.map(c => c.coord)).toEqual([[20, 82], [50, 96]]);
    expect(cortes[0].label.formatter).toContain('A: 20% dos produtos');
    expect(cortes[0].label.formatter).toContain('82,0% do faturamento');
    expect(cortes[1].label.formatter).toContain('B: 50% dos produtos');
  });

  it('usa rótulos curtos nos cortes quando o gráfico é estreito', () => {
    const corte = serie(dez, ESTREITO).markPoint.data[0];

    expect(corte.label.formatter).toContain('A: 20% dos itens');
    expect(corte.label.formatter).toContain('82,0% do fat.');
  });

  it('põe o rótulo à direita do ponto e o encosta na borda quando não cabe', () => {
    // 200px: cerca de 150px de área de plotagem
    const [corteA, corteB] = serie(dez, 200).markPoint.data;

    // A, em 20%, cabe ao lado do ponto
    expect(corteA.label.position).toEqual([14, 6]);
    // B, em 50%, não cabe: o deslocamento puxa o rótulo para a esquerda
    expect(corteB.label.position[0]).toBeLessThan(14);
  });

  it('omite faixa e corte da classe sem produtos', () => {
    // Um produto concentra 96% do faturamento: vai para A, e o seguinte já parte de 96% (C)
    // A faixa da C começa onde a A terminou
    const semB: CurvaAbcDto = {
      totalProdutos: 4,
      faturamento: 100,
      pontos: pontos([96, 99, 100, 100], ['A', 'C', 'C', 'C']),
      classes: [classe('A', 1, 25, 96, 96, [25, 96]), classe('B', 0, 0, 0, 0, null), classe('C', 3, 75, 4, 4, [100, 100])],
    };
    const s = serie(semB);

    expect(s.markArea.data.map(([inicio, fim]) => [inicio.label.formatter, inicio.xAxis, fim.xAxis])).toEqual([
      ['A', 0, 25],
      ['C', 25, 100],
    ]);
    expect(s.markPoint.data.map(c => c.coord)).toEqual([[25, 96]]);
  });

  it('informa no tooltip a posição, a classe e o acumulado do produto', () => {
    const opcoes = montarOpcoesCurvaAbc(dez, paleta, LARGO) as { tooltip: { formatter: (p: { dataIndex: number }[]) => string } };
    const dica = opcoes.tooltip.formatter([{ dataIndex: 3 }]);

    expect(dica).toContain('Produto #3 de 10 · Classe B');
    expect(dica).toContain('30% dos produtos');
    expect(dica).toContain('88,0% do faturamento');
    expect(opcoes.tooltip.formatter([{ dataIndex: 0 }])).toBe('');
  });

  it('com a curva amostrada, mostra no tooltip a posição real do produto', () => {
    // 1.000 produtos, com um ponto a cada 5 posições (a API amostra acima de 200 produtos)
    const amostrada: CurvaAbcDto = {
      ...dez,
      totalProdutos: 1000,
      pontos: [
        { posicao: 5, classe: 'A', percentualProdutos: 0.5, percentualFaturamento: 12.34 },
        { posicao: 10, classe: 'A', percentualProdutos: 1, percentualFaturamento: 20.1 },
      ],
    };
    const opcoes = montarOpcoesCurvaAbc(amostrada, paleta, LARGO) as {
      series: SerieCurva[];
      tooltip: { formatter: (p: { dataIndex: number }[]) => string };
    };

    expect(opcoes.series[0].data).toEqual([[0, 0], [0.5, 12.34], [1, 20.1]]);
    expect(opcoes.tooltip.formatter([{ dataIndex: 2 }])).toContain('Produto #10 de 1000 · Classe A');
  });
});

describe('descreverCurvaAbc', () => {
  it('resume cada classe com produtos, mix e faturamento', () => {
    expect(descreverCurvaAbc(dez)).toBe(
      'Curva ABC de 10 produtos, do maior para o menor faturamento. ' +
        'Classe A: 2 produtos (20,0% do mix), 82,0% do faturamento. ' +
        'Classe B: 3 produtos (30,0% do mix), 14,0% do faturamento. ' +
        'Classe C: 5 produtos (50,0% do mix), 4,0% do faturamento.',
    );
  });

  it('indica a classe sem produtos', () => {
    const semB = { ...dez, classes: [dez.classes[0], classe('B', 0, 0, 0, 0, null), dez.classes[2]] };

    expect(descreverCurvaAbc(semB)).toContain('Classe B: nenhum produto.');
  });
});

describe('tabelaCurvaAbc', () => {
  it('lista uma linha por classe', () => {
    const tabela = tabelaCurvaAbc(dez);

    expect(tabela.colunas).toEqual(['Classe', 'Produtos', '% do mix', '% do faturamento', 'Faturamento']);
    expect(tabela.linhas.map(linha => linha.map(texto))).toEqual([
      ['Classe A', '2', '20,0%', '82,0%', 'R$ 820,00'],
      ['Classe B', '3', '30,0%', '14,0%', 'R$ 140,00'],
      ['Classe C', '5', '50,0%', '4,0%', 'R$ 40,00'],
    ]);
  });
});
