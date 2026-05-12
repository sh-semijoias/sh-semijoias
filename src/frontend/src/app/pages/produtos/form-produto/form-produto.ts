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
import { CategoriaProdutoDto, ProdutoDto, produtoService } from '../../../core/services/produto.service';

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
  readonly saving = signal(false);
  readonly categories = signal<CategoriaProdutoDto[]>([]);
  readonly product = signal<ProdutoDto | null>(null);

  private productId: string | null = null;

  readonly form = this.fb.group({
    data: ['', Validators.required],
    descricao: ['', [Validators.required]],
    idCategoria: [null as number | null, Validators.required],
    precoCompra: ['', Validators.required],
    precoVendaSugerido: ['', Validators.required]
  });


  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.loadCategories();
    if (this.productId) {
      this.modoEdicao.set(true);
      this.form.get('data')!.disable();
      this.carregando.set(true);
      this.loadProduct(this.productId);
    }
  }

  loadCategories(): void {
    this.service.listarCategorias().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.applySelectedCategory();
      },
      error: () => this.categories.set([])
    });
  }

  private loadProduct(id: string): void {
    this.service.obterPorId(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.form.patchValue({
          data: product.data,
          descricao: product.descricao,
          idCategoria: this.getCategoryId(product.categoria),
          precoCompra: this.formatMaskValue(product.precoCompra),
          precoVendaSugerido: this.formatMaskValue(product.precoVendaSugerido)
        });
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false)
    });
  }

  private applySelectedCategory(): void {
    if (!this.productId) return;
    if (!this.product()) return;
    this.form.patchValue({ idCategoria: this.getCategoryId(this.product()!.categoria) });
  }

  private getCategoryId(categoryDescription: string): number | null {
    return this.categories().find((category) => category.descricao === categoryDescription)?.id ?? null;
  }

  private parseCurrency(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    const textValue = value.toString().trim();
    const withoutCurrency = textValue.replace(/\s|R\$/g, '');
    const normalized = withoutCurrency.includes(',')
      ? withoutCurrency.replace(/\./g, '').replace(',', '.')
      : withoutCurrency.replace(/,/g, '');
    const parsed = Number.parseFloat(normalized);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private formatMaskValue(value: string | number): string {
    const numericValue = this.parseCurrency(value);
    if (numericValue === null) return '';
    return numericValue.toFixed(2).replace('.', ',');
  }

  salvar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { data, descricao, idCategoria, precoCompra, precoVendaSugerido } = this.form.getRawValue();
    const precoCompraValor = this.parseCurrency(precoCompra);
    const precoVendaValor = this.parseCurrency(precoVendaSugerido);
    if (precoCompraValor === null || precoVendaValor === null) {
      this.snackBar.open('Informe os preços com o formato correto.', 'Fechar', { duration: 6000, panelClass: ['snack-error'] });
      return;
    }

    this.saving.set(true);

  const onError = (e: { error?: { erros?: string[] } }) => {
    const erros: string[] = e?.error?.erros ?? ['Erro ao salvar.'];
    this.snackBar.open(
      erros.join('\n'),
      'Fechar',
      { duration: 6000, panelClass: ['snack-error'] }
    );
    this.saving.set(false);
  };

  const onSuccess = () => {
    this.snackBar.open(
      this.modoEdicao()
        ? 'Produto atualizado com sucesso!'
        : 'Produto cadastrado com sucesso!',
      'Fechar',
      { duration: 3000 }
    );

    this.router.navigate(['/produtos']);
  };

  if (this.modoEdicao() && this.productId) {
    this.service.editar(this.productId, {
      descricao: descricao!,
      idCategoria: idCategoria!,
      precoCompra: precoCompraValor!,
      precoVendaSugerido: precoVendaValor!
    }).subscribe({
      next: onSuccess,
      error: onError
    });
  } else {
    this.service.criar({
      data: data!,
      descricao: descricao!,
      idCategoria: idCategoria!,
      precoCompra: precoCompraValor!,
      precoVendaSugerido: precoVendaValor!
    }).subscribe({
      next: onSuccess,
      error: onError
    });
  }
}
}
