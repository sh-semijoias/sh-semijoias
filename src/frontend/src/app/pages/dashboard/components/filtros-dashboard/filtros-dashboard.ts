import { Component, computed, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { produtoService } from '../../../../core/services/produto.service';
import { AutocompletePaginadoComponent } from '../../../../shared/components/autocomplete-paginado/autocomplete-paginado';
import { SeletorPeriodoComponent } from '../../../../shared/components/seletor-periodo/seletor-periodo';
import { Periodo } from '../../../../shared/components/seletor-periodo/periodo';
import { DashboardFiltrosService } from '../../dashboard-filtros.service';

interface RevendedorOpcao { id: string; nome: string; }

@Component({
  selector: 'app-filtros-dashboard',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, AutocompletePaginadoComponent, SeletorPeriodoComponent],
  templateUrl: './filtros-dashboard.html',
})
export class FiltrosDashboardComponent {
  private readonly filtros = inject(DashboardFiltrosService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly produtoService = inject(produtoService);

  protected readonly categorias = toSignal(this.produtoService.listarCategorias(), { initialValue: [] });
  protected readonly periodo = computed(() => this.filtros.filtros().periodo);
  protected readonly idTipoProduto = computed(() => this.filtros.filtros().idTipoProduto);

  protected readonly revendedorControl = new FormControl<RevendedorOpcao | null>(null);
  protected readonly displayRevendedor = (r: RevendedorOpcao | null): string => r?.nome ?? '';
  protected readonly loadRevendedoresFn = (pagina: number, busca: string) =>
    this.usuarioService.listarRevendedoresPaginado(pagina, busca);

  protected alterarPeriodo(periodo: Periodo): void {
    this.filtros.atualizar({ periodo });
  }

  protected alterarRevendedor(id: string | number | null): void {
    this.filtros.atualizar({ idRevendedora: id == null ? null : String(id) });
  }

  protected alterarCategoria(id: number | null): void {
    this.filtros.atualizar({ idTipoProduto: id });
  }
}
