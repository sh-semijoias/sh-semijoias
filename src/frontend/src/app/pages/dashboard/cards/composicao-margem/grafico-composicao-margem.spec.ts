import { describe, expect, it } from 'vitest';
import { MargemBrutaDto } from '../../../../core/services/dashboard.service';
import { PaletaGrafico } from '../../graficos/tema-grafico';
import {
  descreverComposicaoMargem,
  montarOpcoesComposicaoMargem,
  montarPassosCascata,
  tabelaComposicaoMargem,
} from './grafico-composicao-margem';

// O Intl separa "R$" do valor com espaço não separável
const texto = (valor: string) => valor.replace(/ /g, ' ');

function margem(faturamento: number, repasse: number, cmv: number): MargemBrutaDto {
  const lucroBruto = faturamento - repasse - cmv;
  return { percentual: (lucroBruto / faturamento) * 100, variacaoPercentual: null, faturamento, repasse, cmv, lucroBruto };
}

const paleta = {
  primaria: 'lucro',
  classeB: 'faturamento',
  deducao: 'deducao',
  texto: 'texto',
  textoSecundario: 'secundario',
} as PaletaGrafico;

interface Serie {
  name: string;
  data: (number | { value: number; itemStyle: { color: string }; label: { show: boolean; formatter: () => string } })[];
}

const series = (dados: MargemBrutaDto) => (montarOpcoesComposicaoMargem(dados, paleta) as { series: Serie[] }).series;
const valores = (serie: Serie) => serie.data.map(d => (typeof d === 'number' ? d : d.value));

describe('montarPassosCascata', () => {
  it('desce do faturamento ao lucro, cada dedução a partir do fim da anterior', () => {
    const passos = montarPassosCascata(margem(212400, 42500, 114700));

    expect(passos.map(p => [p.nome, p.baixo, p.alto])).toEqual([
      ['Faturamento', 0, 212400],
      ['Repasse', 169900, 212400],
      ['CMV', 55200, 169900],
      ['Lucro bruto', 0, 55200],
    ]);
  });
});

describe('montarOpcoesComposicaoMargem', () => {
  it('empilha uma base transparente sob cada barra', () => {
    const [base, positivo, negativo] = series(margem(212400, 42500, 114700));

    expect(valores(base)).toEqual([0, 169900, 55200, 0]);
    expect(valores(positivo)).toEqual([212400, 42500, 114700, 55200]);
    expect(valores(negativo)).toEqual([0, 0, 0, 0]);
  });

  it('colore faturamento, deduções e lucro e rotula com nome e valor', () => {
    const [, positivo] = series(margem(212400, 42500, 114700));
    const itens = positivo.data as Exclude<Serie['data'][number], number>[];

    expect(itens.map(i => i.itemStyle.color)).toEqual(['faturamento', 'deducao', 'deducao', 'lucro']);
    expect(itens.map(i => texto(i.label.formatter()))).toEqual(['R$ 212.400', '− R$ 42.500', '− R$ 114.700', 'R$ 55.200']);
  });

  it('com prejuízo, a dedução que cruza o zero e o lucro descem abaixo do eixo', () => {
    const [base, positivo, negativo] = series(margem(1000, 300, 900));

    expect(valores(base)).toEqual([0, 700, 0, 0]);
    expect(valores(positivo)).toEqual([1000, 300, 700, 0]);
    expect(valores(negativo)).toEqual([0, 0, -200, -200]);
  });
});

describe('descreverComposicaoMargem', () => {
  it('resume a cascata e a margem', () => {
    expect(texto(descreverComposicaoMargem(margem(212400, 42500, 114700)))).toBe(
      'Composição da margem: faturamento de R$ 212.400,00, menos repasse de R$ 42.500,00 ' +
        'e custo das mercadorias vendidas de R$ 114.700,00, resulta em lucro bruto de R$ 55.200,00. Margem bruta de 25,99%.',
    );
  });

  it('informa prejuízo quando o lucro é negativo', () => {
    expect(texto(descreverComposicaoMargem(margem(1000, 300, 900)))).toContain('prejuízo bruto de R$ 200,00');
  });
});

describe('tabelaComposicaoMargem', () => {
  it('lista as etapas com o sinal das deduções', () => {
    const tabela = tabelaComposicaoMargem(margem(212400, -500, 114700));

    expect(tabela.colunas).toEqual(['Etapa', 'Valor']);
    expect(tabela.linhas.map(l => l.map(texto))).toEqual([
      ['Faturamento', 'R$ 212.400,00'],
      ['Repasse', '+ R$ 500,00'],
      ['CMV', '− R$ 114.700,00'],
      ['Lucro bruto', 'R$ 98.200,00'],
    ]);
  });
});
