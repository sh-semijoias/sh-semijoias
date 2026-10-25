import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

// Carregado sob demanda pelo provideEchartsCore; registrar aqui só os módulos usados pelos gráficos do dashboard
use([LineChart, GridComponent, TooltipComponent, SVGRenderer]);

export * from 'echarts/core';
