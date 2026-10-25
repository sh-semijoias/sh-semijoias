import { describe, expect, it } from 'vitest';
import { TicketMedioMesDto } from '../../../../core/services/dashboard.service';
import { descreverTicketMensal, montarOpcoesTicketMensal, tabelaTicketMensal } from './grafico-ticket-mensal';

// Nov/2025 a out/2026, com os valores informados na ordem
function meses(...tickets: (number | null)[]): TicketMedioMesDto[] {
  return tickets.map((ticketMedio, i) => {
    const data = new Date(2025, 10 + i, 1);
    return { ano: data.getFullYear(), mes: data.getMonth() + 1, ticketMedio };
  });
}

// O Intl separa "R$" do valor com espaço não separável
const texto = (valor: string) => valor.replace(/\u00a0/g, ' ');

const doze = meses(150, null, 205.4, 162.1, null, 170, 172, 180, 168, 185, 190, 186.32);

describe('montarOpcoesTicketMensal', () => {
  it('rotula o eixo horizontal com os meses abreviados, em ordem', () => {
    const opcoes = montarOpcoesTicketMensal(doze) as { xAxis: { data: string[] } };

    expect(opcoes.xAxis.data).toEqual(['Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out']);
  });

  it('mantém null nos meses sem vendas, sem ligar os vizinhos', () => {
    const opcoes = montarOpcoesTicketMensal(doze) as { series: { data: (number | null)[]; connectNulls: boolean }[] };

    expect(opcoes.series[0].data[1]).toBeNull();
    expect(opcoes.series[0].data[4]).toBeNull();
    expect(opcoes.series[0].connectNulls).toBe(false);
  });

  it('informa no tooltip os meses sem vendas e o mês em andamento', () => {
    const opcoes = montarOpcoesTicketMensal(doze) as { tooltip: { formatter: (p: { dataIndex: number }[]) => string } };

    expect(opcoes.tooltip.formatter([{ dataIndex: 1 }])).toContain('Sem vendas');
    expect(opcoes.tooltip.formatter([{ dataIndex: 11 }])).toContain('Outubro de 2026 (em andamento)');
  });
});

describe('descreverTicketMensal', () => {
  it('resume o intervalo, o maior e o menor valor e os meses sem vendas', () => {
    expect(texto(descreverTicketMensal(doze))).toBe(
      'Ticket médio por mês, de novembro de 2025 a outubro de 2026. ' +
        'Maior valor em janeiro de 2026: R$ 205,40. ' +
        'Menor valor em novembro de 2025: R$ 150,00. ' +
        '2 meses sem vendas.',
    );
  });

  it('descreve um único mês com vendas, mesmo isolado entre meses vazios', () => {
    const umMes = meses(null, null, null, null, null, 120, null, null, null, null, null, null);

    expect(texto(descreverTicketMensal(umMes))).toContain('Único mês com vendas: abril de 2026, R$ 120,00.');
    expect(descreverTicketMensal(umMes)).toContain('11 meses sem vendas.');
  });
});

describe('tabelaTicketMensal', () => {
  it('lista cada mês por extenso com o valor ou "Sem vendas"', () => {
    const tabela = tabelaTicketMensal(doze);
    const linhas = tabela.linhas.map(linha => linha.map(texto));

    expect(tabela.colunas).toEqual(['Mês', 'Ticket médio']);
    expect(linhas).toHaveLength(12);
    expect(linhas[0]).toEqual(['Novembro de 2025', 'R$ 150,00']);
    expect(linhas[1]).toEqual(['Dezembro de 2025', 'Sem vendas']);
    expect(linhas[11]).toEqual(['Outubro de 2026 (em andamento)', 'R$ 186,32']);
  });
});
