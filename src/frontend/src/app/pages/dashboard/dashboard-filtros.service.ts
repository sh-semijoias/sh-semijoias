import { Injectable, computed, signal } from '@angular/core';
import { FiltrosIndicadores } from '../../core/services/dashboard.service';

export interface FiltrosDashboard {
  inicio: Date;
  fim: Date;
  idRevendedora: string | null;
  idTipoProduto: number | null;
}

// Estado dos filtros compartilhado pelos cards; fornecido no DashboardComponent
@Injectable()
export class DashboardFiltrosService {
  readonly filtros = signal<FiltrosDashboard>({
    ...ultimos90Dias(),
    idRevendedora: null,
    idTipoProduto: null,
  });

  readonly filtrosApi = computed<FiltrosIndicadores>(() => {
    const filtros = this.filtros();
    return {
      dataInicio: formatarDataApi(filtros.inicio),
      dataFim: formatarDataApi(filtros.fim),
      idRevendedora: filtros.idRevendedora ?? undefined,
      idTipoProduto: filtros.idTipoProduto ?? undefined,
    };
  });

  atualizar(alteracao: Partial<FiltrosDashboard>): void {
    this.filtros.update(filtros => ({ ...filtros, ...alteracao }));
  }
}

function ultimos90Dias(): { inicio: Date; fim: Date } {
  const fim = new Date();
  const inicio = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate() - 89);
  return { inicio, fim };
}

// Usa a data local (e não toISOString, que converte para UTC e pode trocar o dia)
function formatarDataApi(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
