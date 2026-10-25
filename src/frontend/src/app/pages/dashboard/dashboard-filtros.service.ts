import { Injectable, computed, signal } from '@angular/core';
import { FiltrosIndicadores, FiltrosSemPeriodo } from '../../core/services/dashboard.service';
import { Periodo, calcularAtalho } from '../../shared/components/seletor-periodo/periodo';

export interface FiltrosDashboard {
  periodo: Periodo;
  idRevendedora: string | null;
  idTipoProduto: number | null;
}

// Estado dos filtros compartilhado pelos cards; fornecido no DashboardComponent
@Injectable()
export class DashboardFiltrosService {
  readonly filtros = signal<FiltrosDashboard>({
    periodo: calcularAtalho('ultimos90'),
    idRevendedora: null,
    idTipoProduto: null,
  });

  readonly filtrosApi = computed<FiltrosIndicadores>(() => {
    const filtros = this.filtros();
    return {
      dataInicio: formatarDataApi(filtros.periodo.inicio),
      dataFim: formatarDataApi(filtros.periodo.fim),
      idRevendedora: filtros.idRevendedora ?? undefined,
      idTipoProduto: filtros.idTipoProduto ?? undefined,
    };
  });

  // Para cards que não seguem o período: só emite quando revendedora ou categoria mudam
  readonly filtrosSemPeriodo = computed<FiltrosSemPeriodo>(
    () => {
      const { idRevendedora, idTipoProduto } = this.filtrosApi();
      return { idRevendedora, idTipoProduto };
    },
    { equal: (a, b) => a.idRevendedora === b.idRevendedora && a.idTipoProduto === b.idTipoProduto },
  );

  atualizar(alteracao: Partial<FiltrosDashboard>): void {
    this.filtros.update(filtros => ({ ...filtros, ...alteracao }));
  }
}

// Usa a data local (e não toISOString, que converte para UTC e pode trocar o dia)
function formatarDataApi(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
