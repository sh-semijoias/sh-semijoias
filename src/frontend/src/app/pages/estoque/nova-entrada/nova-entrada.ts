import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EstoqueService, ProdutoResumidoDto } from '../../../core/services/estoque.service';
import { AddRowButtonComponent } from '../../../shared/components/add-row-button/add-row-button';

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
    MatSelectModule,
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
export class NovaEntradaEstoqueComponent implements OnInit {
  private readonly service = inject(EstoqueService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly produtos = signal<ProdutoResumidoDto[]>([]);
  readonly carregando = signal(true);
  readonly salvando = signal(false);

  readonly form = this.fb.group({
    itens: this.fb.array([], aoMenosUmItem),
  });

  get itens(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  ngOnInit(): void {
    this.service.listarProdutos().subscribe({
      next: (lista) => {
        this.produtos.set(lista);
        this.carregando.set(false);
        this.adicionarItem();
      },
      error: () => {
        this.carregando.set(false);
        this.snackBar.open('Não foi possível carregar os produtos.', 'Fechar', { duration: 4000 });
      },
    });
  }

  adicionarItem(): void {
    this.itens.push(
      this.fb.group({
        idProduto: [null, Validators.required],
        quantidade: [null, [Validators.required, Validators.min(1)]],
      })
    );
  }

  removerItem(index: number): void {
    if (this.itens.length > 1) this.itens.removeAt(index);
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
