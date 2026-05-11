import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { EstoqueService, ProdutoResumidoDto } from '../../../core/services/estoque.service';
import { AddRowButtonComponent } from '../../../shared/components/add-row-button/add-row-button';

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
  selector: 'app-nova-entrada-estoque',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    AddRowButtonComponent,
  ],
  templateUrl: './nova-entrada.html',
})
export class NovaEntradaEstoqueComponent implements OnInit, OnDestroy {
  private readonly service = inject(EstoqueService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly estadoLinhas = signal<EstadoLinha[]>([]);
  readonly salvando = signal(false);
  readonly displayProduto = (produto: ProdutoResumidoDto | null): string =>
    produto ? produto.descricao : '';

  private readonly busca$ = new Subject<{ index: number; busca: string }>();
  private readonly destroy$ = new Subject<void>();

  readonly form = this.fb.group({
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

    this.adicionarItem();
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
    if (this.itens.length > 1) {
      this.itens.removeAt(index);
      this.estadoLinhas.update(arr => arr.filter((_, i) => i !== index));
    }
  }

  carregarProdutosLinha(index: number, busca: string): void {
    this.estadoLinhas.update(arr =>
      arr.map((e, i) => i === index ? { ...e, carregando: true } : e)
    );
    this.service.listarProdutos(busca || undefined, 1, 10)
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
    if (!valor) this.itens.at(index).get('idProduto')?.setValue(null);
    this.busca$.next({ index, busca: valor });
  }

  produtosSelecionadosExceto(index: number): number[] {
    return this.itens.controls
      .map((c, i) => i !== index ? c.get('idProduto')?.value as number | null : null)
      .filter((id): id is number => id !== null);
  }

  selecionarProduto(index: number, produto: ProdutoResumidoDto): void {
    this.itens.at(index).get('idProduto')?.setValue(produto.id);
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
    const dto = { itens: this.itens.value };

    this.service.registrarEntrada(dto).subscribe({
      next: () => {
        this.snackBar.open('Entrada registrada com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/estoque']);
      },
      error: () => {
        this.salvando.set(false);
        this.snackBar.open('Erro ao registrar entrada. Tente novamente.', 'Fechar', { duration: 4000 });
      },
    });
  }
}
