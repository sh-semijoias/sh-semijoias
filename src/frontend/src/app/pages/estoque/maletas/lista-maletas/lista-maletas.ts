import { Component, OnInit, OnDestroy, inject, signal, computed, LOCALE_ID } from '@angular/core';
import { DatePipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MaletaDto, MaletaService, OrdenacaoMaleta } from '../../../../core/services/maleta.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Perfil } from '../../../../core/enums/perfil.enum';

@Component({
  selector: 'app-lista-maletas',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatMenuModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    DatePipe,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './lista-maletas.html'
})
export class ListaMaletasComponent implements OnInit, OnDestroy {
  private readonly service = inject(MaletaService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  readonly isAdmin = computed(() => this.auth.currentUser()?.role === Perfil.Administrador);

  private readonly colunaParaOrdenacao: Record<string, OrdenacaoMaleta> = {
    descricao:      OrdenacaoMaleta.Descricao,
    nomeUsuario:    OrdenacaoMaleta.NomeUsuario,
    totalProdutos:  OrdenacaoMaleta.TotalProdutos,
    totalItens:     OrdenacaoMaleta.TotalItens,
    dataCadastro:   OrdenacaoMaleta.DataCadastro,
    dataAtualizacao: OrdenacaoMaleta.DataAtualizacao,
  };

  readonly colunas = ['descricao', 'nomeUsuario', 'totalProdutos', 'totalItens', 'dataCadastro', 'acoes'];
  readonly itens = signal<MaletaDto[]>([]);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal(false);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly tamanhoPagina = signal(10);
  readonly ordenarPor = signal<OrdenacaoMaleta | null>(null);
  readonly ordemDecrescente = signal(false);

  readonly buscaControl = new FormControl('');

  ngOnInit(): void {
    this.buscaControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pagina.set(1);
      this.carregar();
    });

    this.carregar();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erroCarregamento.set(false);
    this.service.listar({
      pagina: this.pagina(),
      tamanhoPagina: this.tamanhoPagina(),
      busca: this.buscaControl.value ?? undefined,
      ordenarPor: this.ordenarPor() ?? undefined,
      ordemDecrescente: this.ordemDecrescente(),
    }).subscribe({
      next: (resultado) => {
        this.itens.set(resultado.items);
        this.total.set(resultado.total);
        this.carregando.set(false);
      },
      error: () => {
        this.erroCarregamento.set(true);
        this.carregando.set(false);
      }
    });
  }

  onPaginaChange(event: PageEvent): void {
    this.pagina.set(event.pageIndex + 1);
    this.tamanhoPagina.set(event.pageSize);
    this.carregar();
  }

  aoOrdenar(sort: Sort): void {
    if (sort.direction === '') {
      this.ordenarPor.set(null);
      this.ordemDecrescente.set(false);
    } else {
      this.ordenarPor.set(this.colunaParaOrdenacao[sort.active] ?? OrdenacaoMaleta.Descricao);
      this.ordemDecrescente.set(sort.direction === 'desc');
    }
    this.pagina.set(1);
    this.carregar();
  }

  nova(): void {
    this.router.navigate(['/maletas/nova']);
  }

  editar(item: MaletaDto): void {
    this.router.navigate(['/maletas', item.id, 'editar']);
  }
}
