export type AtalhoPeriodo = 'ultimos30' | 'ultimos90' | 'ultimos12meses';

export interface Periodo {
  inicio: Date;
  fim: Date;
  atalho: AtalhoPeriodo | null;
}

export const ATALHOS_PERIODO: { id: AtalhoPeriodo; rotulo: string; rotuloCurto: string }[] = [
  { id: 'ultimos30', rotulo: 'Últimos 30 dias', rotuloCurto: '30 dias' },
  { id: 'ultimos90', rotulo: 'Últimos 90 dias', rotuloCurto: '90 dias' },
  { id: 'ultimos12meses', rotulo: 'Últimos 12 meses', rotuloCurto: '12 meses' },
];

// Todos os atalhos terminam hoje e incluem o dia de hoje
export function calcularAtalho(atalho: AtalhoPeriodo, hoje = new Date()): Periodo {
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return { inicio: calcularInicio(atalho, fim), fim, atalho };
}

export function rotuloPeriodo(periodo: Periodo): { atalho: string | null; datas: string } {
  const atalho = ATALHOS_PERIODO.find(a => a.id === periodo.atalho);
  return {
    atalho: atalho?.rotulo ?? null,
    datas: `${formatarData(periodo.inicio)} – ${formatarData(periodo.fim)}`,
  };
}

export function formatarData(data: Date): string {
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${data.getFullYear()}`;
}

function calcularInicio(atalho: AtalhoPeriodo, fim: Date): Date {
  const ano = fim.getFullYear();
  const mes = fim.getMonth();
  const dia = fim.getDate();

  switch (atalho) {
    case 'ultimos30':
      return new Date(ano, mes, dia - 29);
    case 'ultimos90':
      return new Date(ano, mes, dia - 89);
    case 'ultimos12meses': {
      // Mesmo dia do ano anterior (29/02 vira 28/02) + 1 dia
      const ultimoDiaDoMes = new Date(ano - 1, mes + 1, 0).getDate();
      return new Date(ano - 1, mes, Math.min(dia, ultimoDiaDoMes) + 1);
    }
  }
}
