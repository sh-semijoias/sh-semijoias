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
import { ClientesService } from '../../../core/services/clientes.service';
//import { PerfilDto, PerfilService } from '../../../core/services/perfil.service';

@Component({
  selector: 'app-form-clientes',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule,
    NgxMaskDirective
  ],
  templateUrl: './form-clientes.html'
})
export class FormClienteComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ClientesService);
//  private readonly perfilService = inject(PerfilService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

//  readonly perfis = signal<PerfilDto[]>([]);
  readonly modoEdicao = signal(false);
  readonly carregando = signal(false);
  readonly salvando = signal(false);

  private clienteId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', Validators.required],
    telefone: [null as string | null, Validators.required]
  });


  ngOnInit(): void {
 //   this.perfilService.listar().subscribe((lista) => this.perfis.set(lista));

    this.clienteId = this.route.snapshot.paramMap.get('id');
    if (this.clienteId) {
      this.modoEdicao.set(true);
      this.form.get('email')!.disable();
      this.carregando.set(true);
      this.service.obterPorId(this.clienteId).subscribe({
        next: (u) => {
          this.form.patchValue({ nome: u.nome, email: u.email, telefone: u.telefone , cpf: u.cpf });
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

    const { nome, email, cpf, telefone } = this.form.getRawValue();

    const onError = (e: { error?: { erros?: string[] } }) => {
      const erros: string[] = e?.error?.erros ?? ['Erro ao salvar.'];
      this.snackBar.open(erros.join('\n'), 'Fechar', { duration: 6000, panelClass: ['snack-error'] });
      this.salvando.set(false);
    };

    if (this.modoEdicao() && this.clienteId) {
      this.service.editar(this.clienteId, { nome: nome!, cpf: cpf!, telefone: telefone!, email :email! }).subscribe({
        next: () => this.router.navigate(['/clientes']),
        error: onError
      });
    } else {
      this.service.criar({ nome: nome!, email: email!, cpf: cpf!, telefone: telefone! }).subscribe({
        next: () => this.router.navigate(['/clientes']),
        error: onError
      });
    }
  }
}
