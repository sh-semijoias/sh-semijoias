import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilDto, PerfilService } from '../../../core/services/perfil.service';
import { Perfil } from '../../../core/enums/perfil.enum';

@Component({
  selector: 'app-form-usuario',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  templateUrl: './form-usuario.html'
})
export class FormUsuarioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UsuarioService);
  private readonly perfilService = inject(PerfilService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly perfis = signal<PerfilDto[]>([]);
  readonly modoEdicao = signal(false);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly mostrarComissao = signal(false);
  readonly erro = signal('');

  private usuarioId: string | null = null;

  readonly form = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    perfil: ['', Validators.required],
    percentualComissao: [null as number | null]
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
          this.form.patchValue({ nome: u.nome, email: u.email, perfil: u.perfil, percentualComissao: u.percentualComissao });
          this.atualizarComissao(u.perfil);
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false)
      });
    }

    this.form.get('perfil')!.valueChanges.subscribe((perfil) => this.atualizarComissao(perfil ?? ''));
  }

  private atualizarComissao(perfil: string): void {
    const ctrl = this.form.get('percentualComissao')!;
    if (perfil === Perfil.Revendedor) {
      this.mostrarComissao.set(true);
      ctrl.setValidators(Validators.required);
    } else {
      this.mostrarComissao.set(false);
      ctrl.clearValidators();
      ctrl.setValue(null);
    }
    ctrl.updateValueAndValidity();
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.salvando.set(true);
    this.erro.set('');

    const { nome, email, perfil, percentualComissao } = this.form.getRawValue();

    if (this.modoEdicao() && this.usuarioId) {
      this.service.editar(this.usuarioId, { nome: nome!, perfil: perfil!, percentualComissao }).subscribe({
        next: () => this.router.navigate(['/usuarios']),
        error: (e) => { this.erro.set(e?.error?.Erro ?? 'Erro ao salvar.'); this.salvando.set(false); }
      });
    } else {
      this.service.criar({ nome: nome!, email: email!, perfil: perfil!, percentualComissao }).subscribe({
        next: () => this.router.navigate(['/usuarios']),
        error: (e) => { this.erro.set(e?.error?.Erro ?? 'Erro ao salvar.'); this.salvando.set(false); }
      });
    }
  }
}
