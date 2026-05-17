import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EstoqueService, ProdutoResumidoDto } from '../../../core/services/estoque.service';
import { AddRowButtonComponent } from '../../../shared/components/add-row-button/add-row-button';
import { AutocompletePaginadoComponent } from '../../../shared/components/autocomplete-paginado/autocomplete-paginado';

function aoMenosUmItem(control: AbstractControl): ValidationErrors | null {
  const array = control as FormArray;
  return array.length > 0 ? null : { semItens: true };
}

@Component({
  selector: 'app-nova-entrada-estoque',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    AddRowButtonComponent,
    AutocompletePaginadoComponent,
  ],
  templateUrl: './nova-entrada.html',
})
export class NovaEntradaEstoqueComponent implements OnInit, OnDestroy {
  private readonly service = inject(EstoqueService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly produtosSelecionados = signal<(ProdutoResumidoDto | null)[]>([]);
  readonly salvando = signal(false);
  readonly displayProduto = (produto: ProdutoResumidoDto | null): string =>
    produto ? produto.descricao : '';
  readonly loadProdutosFn = (pagina: number, busca: string) =>
    this.service.listarProdutos(busca || undefined, pagina, 10);

  private readonly destroy$ = new Subject<void>();

  readonly form = this.fb.group({
    itens: this.fb.array([], aoMenosUmItem),
  });

  get itens(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  ngOnInit(): void {
    this.adicionarItem();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  adicionarItem(): void {
    this.itens.push(
      this.fb.group({
        idProduto: [null, Validators.required],
        quantidade: [null, [Validators.required, Validators.min(1)]],
      })
    );
    this.produtosSelecionados.update(arr => [...arr, null]);
  }

  removerItem(index: number): void {
    if (this.itens.length > 1) {
      this.itens.removeAt(index);
      this.produtosSelecionados.update(arr => arr.filter((_, i) => i !== index));
    }
  }

  limparProdutoLinha(index: number): void {
    this.itens.at(index).get('idProduto')?.setValue(null);
    this.produtosSelecionados.update(arr => arr.map((e, i) => i === index ? null : e));
  }

  produtosSelecionadosExceto(index: number): number[] {
    return this.produtosSelecionados()
      .map((p, i) => i !== index ? (p?.id as number | null) ?? null : null)
      .filter((id): id is number => id !== null);
  }

  selecionarProduto(index: number, produto: ProdutoResumidoDto): void {
    this.itens.at(index).get('idProduto')?.setValue(produto.id);
    this.produtosSelecionados.update(arr => arr.map((e, i) => i === index ? produto : e));
  }

  confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.salvando.set(true);
    const itens = this.itens.value as { idProduto: number; quantidade: number }[];
    this.service.registrarEntrada({ itens }).subscribe({
      next: () => {
        this.snackBar.open('Entrada registrada com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/estoque']);
      },
      error: (e: { error?: { erros?: string[] } }) => {
        const erros = e?.error?.erros ?? ['Erro ao salvar. Tente novamente.'];
        this.snackBar.open(erros.join('\n'), 'Fechar', { duration: 6000, panelClass: ['snack-error'] });
        this.salvando.set(false);
      },
    });
  }
}
