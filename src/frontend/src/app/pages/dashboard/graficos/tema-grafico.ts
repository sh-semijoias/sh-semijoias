import { ThemeOption } from 'ngx-echarts';

export interface PaletaGrafico {
  primaria: string;
  terciaria: string;
  superficie: string;
  classeA: string;
  classeB: string;
  classeC: string;
  texto: string;
  textoSecundario: string;
  contorno: string;
  grade: string;
  fundoTooltip: string;
  textoTooltip: string;
  fonte: string;
}

const TOKENS: Record<Exclude<keyof PaletaGrafico, 'fonte'>, string> = {
  primaria: '--mat-sys-primary',
  terciaria: '--mat-sys-tertiary',
  superficie: '--mat-sys-surface',
  // Definidas no styles.scss, compartilhadas com os cards da curva ABC
  classeA: '--cor-classe-a',
  classeB: '--cor-classe-b',
  classeC: '--cor-classe-c',
  texto: '--mat-sys-on-surface',
  textoSecundario: '--mat-sys-on-surface-variant',
  contorno: '--mat-sys-outline',
  grade: '--mat-sys-outline-variant',
  fundoTooltip: '--mat-sys-inverse-surface',
  textoTooltip: '--mat-sys-inverse-on-surface',
};

// O ECharts precisa de cores concretas. Os tokens do Material usam light-dark(), então são resolvidos
// aplicando cada um a um elemento de sonda e lendo a cor calculada.
export function lerPaletaGrafico(): PaletaGrafico {
  const sonda = document.createElement('span');
  sonda.style.display = 'none';
  document.body.appendChild(sonda);

  const resolver = (token: string): string => {
    sonda.style.color = `var(${token})`;
    return getComputedStyle(sonda).color;
  };

  const cores = Object.fromEntries(
    Object.entries(TOKENS).map(([nome, token]) => [nome, resolver(token)]),
  ) as Omit<PaletaGrafico, 'fonte'>;
  sonda.remove();

  return { ...cores, fonte: getComputedStyle(document.body).fontFamily };
}

// Estilo base de todos os gráficos; cada gráfico só define o que é específico dele
export function temaEcharts(paleta: PaletaGrafico): ThemeOption {
  const eixo = {
    axisLine: { lineStyle: { color: paleta.contorno } },
    axisTick: { lineStyle: { color: paleta.contorno } },
    axisLabel: { color: paleta.textoSecundario, fontSize: 12, hideOverlap: true },
    splitLine: { lineStyle: { color: paleta.grade } },
    nameTextStyle: { color: paleta.textoSecundario, fontSize: 12 },
  };

  return {
    color: [paleta.primaria],
    backgroundColor: 'transparent',
    textStyle: { fontFamily: paleta.fonte, color: paleta.texto, fontSize: 12 },
    categoryAxis: { ...eixo, splitLine: { show: false } },
    valueAxis: { ...eixo, axisLine: { show: false }, axisTick: { show: false } },
    tooltip: {
      backgroundColor: paleta.fundoTooltip,
      borderColor: paleta.fundoTooltip,
      textStyle: { color: paleta.textoTooltip, fontFamily: paleta.fonte, fontSize: 13 },
      axisPointer: { lineStyle: { color: paleta.contorno } },
    },
    line: {
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 2 },
    },
  };
}
