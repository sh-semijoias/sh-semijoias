import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

function senhasIguaisValidator(control: AbstractControl): ValidationErrors | null {
  const nova = control.get('novaSenha')?.value;
  const confirmacao = control.get('confirmacaoNovaSenha')?.value;
  return nova && confirmacao && nova !== confirmacao ? { senhasDivergentes: true } : null;
}

export interface DialogTrocarSenhaData {
  exigirSenhaAtual: boolean;
}

@Component({
  selector: 'app-dialog-trocar-senha',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-trocar-senha.html',
})
export class DialogTrocarSenhaComponent {
  private readonly dialogRef = inject(MatDialogRef<DialogTrocarSenhaComponent>);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  readonly data: DialogTrocarSenhaData = inject(MAT_DIALOG_DATA);

  readonly salvando = signal(false);
  readonly erroServidor = signal('');
  readonly showAtual = signal(false);
  readonly showNova = signal(false);
  readonly showConfirmacao = signal(false);

  readonly form = this.fb.group({
    senhaAtual: ['', this.data.exigirSenhaAtual ? Validators.required : []],
    novaSenha: ['', [Validators.required, Validators.minLength(8)]],
    confirmacaoNovaSenha: ['', Validators.required],
  }, { validators: senhasIguaisValidator });

  confirmar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.salvando.set(true);
    this.erroServidor.set('');

    const { senhaAtual, novaSenha, confirmacaoNovaSenha } = this.form.getRawValue();
    this.authService.trocarSenha({
      senhaAtual: this.data.exigirSenhaAtual ? senhaAtual! : undefined,
      novaSenha: novaSenha!,
      confirmacaoNovaSenha: confirmacaoNovaSenha!
    }).subscribe({
      next: () => {
        this.salvando.set(false);
        this.dialogRef.close(true);
      },
      error: (e) => {
        const erros: string[] = e?.error?.erros ?? ['Erro ao trocar senha.'];
        this.erroServidor.set(erros.join(' '));
        this.salvando.set(false);
      },
    });
  }
}
