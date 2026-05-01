import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxMaskDirective } from 'ngx-mask';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilDto, PerfilService } from '../../../core/services/perfil.service';

@Component({
  selector: 'app-form-usuario',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule,
    NgxMaskDirective
  ],
  templateUrl: './form-usuario.html'
})
export class FormUsuarioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuarioService);
  private readonly perfilService = inject(PerfilService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly perfis = signal<PerfilDto[]>([]);
  readonly modoEdicao = signal(false);
  readonly carregando = signal(false);
  readonly salvando = signal(false);

  private usuarioId: string | null = null;

  readonly form = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    perfil: ['', Validators.required],
    telefone: [null as string | null, Validators.required]
  });

  ngOnInit(): void {
    this.perfilService.listar().subscribe((lista) => this.perfis.set(lista));

    this.usuarioId = this.route.snapshot.paramMap.get('id');
    if (this.usuarioId) {
      this.modoEdicao.set(true);
      this.form.get('email')!.disable();
      this.carregando.set(true);
      this.service.obterPorId(this.usuarioId).subscribe({
        next: (u) => {
          this.form.patchValue({ nome: u.nome, email: u.email, perfil: u.perfil, telefone: u.telefone });
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false)
      });
    }
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.salvando.set(true);

    const { nome, email, perfil, telefone } = this.form.getRawValue();

    const onError = (e: { error?: { erros?: string[] } }) => {
      const erros: string[] = e?.error?.erros ?? ['Erro ao salvar.'];
      this.snackBar.open(erros.join('\n'), 'Fechar', { duration: 6000, panelClass: ['snack-error'] });
      this.salvando.set(false);
    };

    if (this.modoEdicao() && this.usuarioId) {
      this.service.editar(this.usuarioId, { nome: nome!, perfil: perfil!, telefone: telefone! }).subscribe({
        next: () => this.router.navigate(['/usuarios']),
        error: onError
      });
    } else {
      this.service.criar({ nome: nome!, email: email!, perfil: perfil!, telefone: telefone! }).subscribe({
        next: () => this.router.navigate(['/usuarios']),
        error: onError
      });
    }
  }
}
