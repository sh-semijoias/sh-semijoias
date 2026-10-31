import { describe, expect, it } from 'vitest';
import { ClasseAbc, ClasseAbcDto, CurvaAbcDto } from '../../../../core/services/dashboard.service';
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

function classe(nome: ClasseAbc, quantidadeProdutos: number, percentualMix: number, percentualFaturamento: number, faturamento: number): ClasseAbcDto {
  return { classe: nome, quantidadeProdutos, percentualMix, percentualFaturamento, faturamento, produtos: [] };
}

// 10 produtos: 2 em A (até 82%), 3 em B (até 96%), 5 em C (2 deles sem vendas)
const dez: CurvaAbcDto = {
  totalProdutos: 10,
  faturamento: 1000,
  percentuaisAcumulados: [50, 82, 88, 92, 96, 98, 99, 100, 100, 100],
  classes: [classe('A', 2, 20, 82, 820), classe('B', 3, 30, 14, 140), classe('C', 5, 50, 4, 40)],
};

// O Intl separa "R$" do valor com espaço não separável
const texto = (valor: string) => valor.replace(/ /g, ' ');

interface SerieCurva {
  data: number[][];
  markArea: { data: [{ xAxis: number; itemStyle: { color: string }; label: { formatter: string } }, { xAxis: number }][] };
  markLine: { data: { yAxis: number }[] };
  markPoint: { data: { coord: number[]; label: { formatter: string } }[] };
}

const serie = (dados: CurvaAbcDto, compacto = false) =>
  (montarOpcoesCurvaAbc(dados, paleta, compacto) as { series: SerieCurva[] }).series[0];

describe('montarOpcoesCurvaAbc', () => {
  it('começa a curva na origem e põe um ponto por produto no % dos produtos', () => {
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

  it('usa rótulos curtos nos cortes quando compacto', () => {
    const corte = serie(dez, true).markPoint.data[0];

    expect(corte.label.formatter).toContain('A: 20% dos itens');
    expect(corte.label.formatter).toContain('82,0% do fat.');
  });

  it('omite faixa e corte da classe sem produtos', () => {
    // Um produto concentra 96% do faturamento: vai para A, e o seguinte já parte de 96% (C)
    const semB: CurvaAbcDto = {
      totalProdutos: 4,
      faturamento: 100,
      percentuaisAcumulados: [96, 99, 100, 100],
      classes: [classe('A', 1, 25, 96, 96), classe('B', 0, 0, 0, 0), classe('C', 3, 75, 4, 4)],
    };
    const s = serie(semB);

    expect(s.markArea.data.map(([inicio]) => inicio.label.formatter)).toEqual(['A', 'C']);
    expect(s.markPoint.data.map(c => c.coord)).toEqual([[25, 96]]);
  });

  it('informa no tooltip a posição, a classe e o acumulado do produto', () => {
    const opcoes = montarOpcoesCurvaAbc(dez, paleta) as { tooltip: { formatter: (p: { dataIndex: number }[]) => string } };
    const dica = opcoes.tooltip.formatter([{ dataIndex: 3 }]);

    expect(dica).toContain('Produto #3 de 10 · Classe B');
    expect(dica).toContain('30% dos produtos');
    expect(dica).toContain('88,0% do faturamento');
    expect(opcoes.tooltip.formatter([{ dataIndex: 0 }])).toBe('');
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
    const semB = { ...dez, classes: [dez.classes[0], classe('B', 0, 0, 0, 0), dez.classes[2]] };

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
