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
import { produtoService } from '../../../core/services/produto.service';

@Component({
  selector: 'app-form-produto',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatCardModule,
    NgxMaskDirective
  ],
  templateUrl: './form-produto.html'
})
export class FormProdutoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(produtoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly modoEdicao = signal(false);
  readonly carregando = signal(false);
  readonly salvando = signal(false);

  private produtoId: string | null = null;

  readonly form = this.fb.group({
    data: ['', Validators.required]
    //,
    // descricao: ['', [Validators.required, Validators.email]],
    // tipo: ['', Validators.required],
    // precoCompra: [null as number | null, Validators.required],
    // precoVendaSugerido: [null as number | null, Validators.required]
  });


  ngOnInit(): void {

    this.produtoId = this.route.snapshot.paramMap.get('id');
    if (this.produtoId) {
      this.modoEdicao.set(true);
      this.form.get('data')!.disable();
      this.carregando.set(true);
      this.service.obterPorId(this.produtoId).subscribe({
        next: (u) => {
          this.form.patchValue({ data: u.data
            // ,
            // descricao: u.descricao, tipo: u.tipo, precoCompra: u.precoCompra, precoVendaSugerido: u.precoVendaSugerido
           });
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

    const { data
      // , descricao, tipo, precoCompra, precoVendaSugerido
     } = this.form.getRawValue();

    const onError = (e: { error?: { erros?: string[] } }) => {
      const erros: string[] = e?.error?.erros ?? ['Erro ao salvar.'];
      this.snackBar.open(erros.join('\n'), 'Fechar', { duration: 6000, panelClass: ['snack-error'] });
      this.salvando.set(false);
    };

    if (this.modoEdicao() && this.produtoId) {
      // this.service.editar(this.produtoId, {descricao: descricao!, tipo: tipo!, precoCompra: precoCompra!, precoVendaSugerido: precoVendaSugerido! }).subscribe({
      //   next: () => this.router.navigate(['/produtos']),
      //   error: onError
      // });
    } else {
      this.service.criar({ data: data!
        // , descricao: descricao!, tipo: tipo!, precoCompra: precoCompra!, precoVendaSugerido: precoVendaSugerido!
       }).subscribe({
        next: () => this.router.navigate(['/produtos']),
        error: onError
      });
    }
  }
}
