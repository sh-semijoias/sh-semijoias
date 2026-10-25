import { EChartsCoreOption } from 'echarts/core';
import { TicketMedioMesDto } from '../../../../core/services/dashboard.service';
import { TabelaGrafico } from '../../graficos/grafico';
import { formatarMoeda, formatarMoedaCurta, rotuloMesCurto, rotuloMesExtenso } from '../../graficos/formatadores';

// O último mês da série é o mês atual, ainda em andamento
function rotuloMes(meses: TicketMedioMesDto[], indice: number): string {
  const { ano, mes } = meses[indice];
  const rotulo = rotuloMesExtenso(ano, mes);
  return indice === meses.length - 1 ? `${rotulo} (em andamento)` : rotulo;
}

function formatarTicket(ticket: number | null): string {
  return ticket === null ? 'Sem vendas' : formatarMoeda(ticket);
}

export function montarOpcoesTicketMensal(meses: TicketMedioMesDto[]): EChartsCoreOption {
  return {
    // 'same': as margens contam a partir dos rótulos dos eixos, não da linha do eixo
    grid: { left: 4, right: 12, top: 12, bottom: 12, outerBoundsMode: 'same' },
    xAxis: {
      type: 'category',
      data: meses.map(m => rotuloMesCurto(m.ano, m.mes)),
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      scale: true,
      splitNumber: 3,
      axisLabel: { formatter: formatarMoedaCurta },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: { dataIndex: number }[]) => {
        const { dataIndex } = params[0];
        return `${rotuloMes(meses, dataIndex)}<br><strong>${formatarTicket(meses[dataIndex].ticketMedio)}</strong>`;
      },
    },
    series: [
      {
        name: 'Ticket médio',
        type: 'line',
        // null interrompe a linha: mês sem vendas fica sem ponto
        data: meses.map(m => m.ticketMedio),
        connectNulls: false,
        showSymbol: true,
      },
    ],
  };
}

export function descreverTicketMensal(meses: TicketMedioMesDto[]): string {
  const primeiro = rotuloMesExtenso(meses[0].ano, meses[0].mes).toLowerCase();
  const ultimo = rotuloMesExtenso(meses[meses.length - 1].ano, meses[meses.length - 1].mes).toLowerCase();
  const partes = [`Ticket médio por mês, de ${primeiro} a ${ultimo}.`];

  const comVendas = meses
    .map((m, indice) => ({ indice, ticket: m.ticketMedio }))
    .filter((m): m is { indice: number; ticket: number } => m.ticket !== null);

  if (comVendas.length === 1) {
    partes.push(`Único mês com vendas: ${rotuloMes(meses, comVendas[0].indice).toLowerCase()}, ${formatarMoeda(comVendas[0].ticket)}.`);
  } else if (comVendas.length > 1) {
    const maior = comVendas.reduce((a, b) => (b.ticket > a.ticket ? b : a));
    const menor = comVendas.reduce((a, b) => (b.ticket < a.ticket ? b : a));
    partes.push(`Maior valor em ${rotuloMes(meses, maior.indice).toLowerCase()}: ${formatarMoeda(maior.ticket)}.`);
    partes.push(`Menor valor em ${rotuloMes(meses, menor.indice).toLowerCase()}: ${formatarMoeda(menor.ticket)}.`);
  }

  const semVendas = meses.length - comVendas.length;
  if (semVendas > 0) partes.push(semVendas === 1 ? '1 mês sem vendas.' : `${semVendas} meses sem vendas.`);

  return partes.join(' ');
}

export function tabelaTicketMensal(meses: TicketMedioMesDto[]): TabelaGrafico {
  return {
    colunas: ['Mês', 'Ticket médio'],
    linhas: meses.map((m, indice) => [rotuloMes(meses, indice), formatarTicket(m.ticketMedio)]),
  };
}
