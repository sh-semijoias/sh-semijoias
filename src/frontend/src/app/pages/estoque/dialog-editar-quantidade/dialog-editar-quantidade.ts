import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EstoqueService } from '../../../core/services/estoque.service';

export interface DialogEditarQuantidadeData {
  idEstoque: number;
  quantidadeAtual: number;
  nomeProduto: string;
}

@Component({
  selector: 'app-dialog-editar-quantidade',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './dialog-editar-quantidade.html',
})
export class DialogEditarQuantidadeComponent {
  private readonly dialogRef = inject(MatDialogRef<DialogEditarQuantidadeComponent>);
  readonly data: DialogEditarQuantidadeData = inject(MAT_DIALOG_DATA);
  private readonly service = inject(EstoqueService);

  readonly salvando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly quantidadeControl = new FormControl<number>(this.data.quantidadeAtual, {
    nonNullable: true,
    validators: [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)],
  });

  salvar(): void {
    if (this.quantidadeControl.invalid) return;

    this.salvando.set(true);
    this.erro.set(null);

    this.service.atualizarQuantidade(this.data.idEstoque, this.quantidadeControl.value).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        const mensagem = err?.error?.erros?.[0] ?? 'Não foi possível atualizar a quantidade.';
        this.erro.set(mensagem);
        this.salvando.set(false);
      },
    });
  }
}
