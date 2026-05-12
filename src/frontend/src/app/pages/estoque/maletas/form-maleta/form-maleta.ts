import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MaletaService } from '../../../../core/services/maleta.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EstoqueService, ProdutoResumidoDto } from '../../../../core/services/estoque.service';
import { AddRowButtonComponent } from '../../../../shared/components/add-row-button/add-row-button';
import { Perfil } from '../../../../core/enums/perfil.enum';

function aoMenosUmItem(control: AbstractControl): ValidationErrors | null {
  const array = control as FormArray;
  return array.length > 0 ? null : { semItens: true };
}

interface EstadoLinha {
  displayValue: string;
  total: number;
  produtos: ProdutoResumidoDto[];
  carregando: boolean;
  produtoSelecionado: ProdutoResumidoDto | null;
}

@Component({
  selector: 'app-form-maleta',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    AddRowButtonComponent,
  ],
  templateUrl: './form-maleta.html',
})
export class FormMaletaComponent implements OnInit, OnDestroy {
  private readonly service = inject(MaletaService);
  private readonly estoqueService = inject(EstoqueService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  private maletaId: number | null = null;

  readonly modoEdicao = signal(false);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly revendedores = signal<{ id: string; nome: string }[]>([]);
  readonly estadoLinhas = signal<EstadoLinha[]>([]);
  readonly itensOriginaisCount = signal(0);
  readonly isAdmin = computed(() => this.auth.currentUser()?.role === Perfil.Administrador);

  readonly displayProduto = (produto: ProdutoResumidoDto | null): string =>
    produto ? produto.descricao : '';

  private readonly busca$ = new Subject<{ index: number; busca: string }>();
  private readonly destroy$ = new Subject<void>();

  readonly form = this.fb.group({
    descricao: ['', [Validators.required, Validators.maxLength(200)]],
    idUsuario: ['' as string, Validators.required],
    itens: this.fb.array([], aoMenosUmItem),
  });

  get itens(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  ngOnInit(): void {
    this.busca$.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => a.index === b.index && a.busca === b.busca),
      takeUntil(this.destroy$)
    ).subscribe(({ index, busca }) => this.carregarProdutosLinha(index, busca));

    this.service.listarRevendedores().subscribe({
      next: (lista) => this.revendedores.set(lista),
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.maletaId = Number(idParam);
      this.modoEdicao.set(true);
      this.carregando.set(true);
      this.service.obterPorId(this.maletaId).subscribe({
        next: (maleta) => {
          this.form.patchValue({ descricao: maleta.descricao, idUsuario: maleta.idUsuario });
          this.itensOriginaisCount.set(maleta.itens.length);
          maleta.itens.forEach(item => {
            const maxOriginal = item.quantidadeGeral + item.quantidade;
            const group = this.fb.group({
              idProduto: [item.idProduto, Validators.required],
              quantidade: [item.quantidade, [Validators.required, Validators.min(0), Validators.max(maxOriginal)]],
            });
            group.get('idProduto')?.disable();
            this.itens.push(group);
            this.estadoLinhas.update(arr => [
              ...arr,
              {
                displayValue: item.descricao,
                total: 1,
                produtos: [{ id: item.idProduto, descricao: item.descricao, quantidade: maxOriginal }],
                carregando: false,
                produtoSelecionado: { id: item.idProduto, descricao: item.descricao, quantidade: maxOriginal },
              },
            ]);
          });
          if (maleta.itens.length === 0) this.adicionarItem();
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });
    } else {
      this.adicionarItem();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  adicionarItem(): void {
    const index = this.itens.length;
    this.itens.push(
      this.fb.group({
        idProduto: [null, Validators.required],
        quantidade: [null, [Validators.required, Validators.min(1)]],
      })
    );
    this.estadoLinhas.update(arr => [
      ...arr,
      { displayValue: '', total: 0, produtos: [], carregando: false, produtoSelecionado: null },
    ]);
    this.carregarProdutosLinha(index, '');
  }

  removerItem(index: number): void {
    if (this.modoEdicao() && index < this.itensOriginaisCount()) return;
    if (this.itens.length > 1) {
      this.itens.removeAt(index);
      this.estadoLinhas.update(arr => arr.filter((_, i) => i !== index));
    }
  }

  carregarProdutosLinha(index: number, busca: string): void {
    this.estadoLinhas.update(arr =>
      arr.map((e, i) => i === index ? { ...e, carregando: true } : e)
    );
    this.estoqueService.listarProdutos(busca || undefined, 1, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.estadoLinhas.update(arr =>
            arr.map((e, i) => i === index
              ? { ...e, carregando: false, produtos: res.items, total: res.total }
              : e)
          );
        },
        error: () => {
          this.estadoLinhas.update(arr =>
            arr.map((e, i) => i === index ? { ...e, carregando: false } : e)
          );
        },
      });
  }

  atualizarDisplay(index: number, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.estadoLinhas.update(arr =>
      arr.map((e, i) => i === index ? { ...e, displayValue: valor } : e)
    );
    if (!valor) {
      this.itens.at(index).get('idProduto')?.setValue(null);
      const qtdCtrl = this.itens.at(index).get('quantidade');
      qtdCtrl?.setValidators([Validators.required, Validators.min(1)]);
      qtdCtrl?.updateValueAndValidity();
      this.estadoLinhas.update(arr =>
        arr.map((e, i) => i === index ? { ...e, produtoSelecionado: null } : e)
      );
    }
    this.busca$.next({ index, busca: valor });
  }

  produtosSelecionadosExceto(index: number): number[] {
    return this.itens.controls
      .map((c, i) => i !== index ? c.get('idProduto')?.value as number | null : null)
      .filter((id): id is number => id !== null);
  }

  selecionarProduto(index: number, produto: ProdutoResumidoDto): void {
    this.itens.at(index).get('idProduto')?.setValue(produto.id);
    const qtdCtrl = this.itens.at(index).get('quantidade');
    qtdCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(produto.quantidade)]);
    qtdCtrl?.updateValueAndValidity();
    this.estadoLinhas.update(arr =>
      arr.map((e, i) => i === index ? { ...e, displayValue: produto.descricao, produtoSelecionado: produto } : e)
    );
  }

  confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);

    const raw = this.form.getRawValue();
    const dto = {
      descricao: raw.descricao!,
      idUsuario: raw.idUsuario!,
      itens: this.itens.getRawValue() as { idProduto: number; quantidade: number }[],
    };

    const onError = (e: { error?: { erros?: string[] } }) => {
      const erros: string[] = e?.error?.erros ?? ['Erro ao salvar. Tente novamente.'];
      this.snackBar.open(erros.join('\n'), 'Fechar', { duration: 6000, panelClass: ['snack-error'] });
      this.salvando.set(false);
    };

    if (this.modoEdicao() && this.maletaId) {
      this.service.editar(this.maletaId, dto).subscribe({
        next: () => {
          this.snackBar.open('Maleta atualizada com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/maletas']);
        },
        error: onError,
      });
    } else {
      this.service.criar(dto).subscribe({
        next: () => {
          this.snackBar.open('Maleta criada com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/maletas']);
        },
        error: onError,
      });
    }
  }
}
