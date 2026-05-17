import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaletaService } from '../../../../core/services/maleta.service';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EstoqueService, ProdutoResumidoDto } from '../../../../core/services/estoque.service';
import { AddRowButtonComponent } from '../../../../shared/components/add-row-button/add-row-button';
import { AutocompletePaginadoComponent } from '../../../../shared/components/autocomplete-paginado/autocomplete-paginado';
import { Perfil } from '../../../../core/enums/perfil.enum';

function aoMenosUmItem(control: AbstractControl): ValidationErrors | null {
  const array = control as FormArray;
  return array.length > 0 ? null : { semItens: true };
}

@Component({
  selector: 'app-form-maleta',
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
  templateUrl: './form-maleta.html',
})
export class FormMaletaComponent implements OnInit {
  private readonly service = inject(MaletaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly estoqueService = inject(EstoqueService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  private maletaId: number | null = null;

  readonly modoEdicao = signal(false);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly produtosOriginaisDisplay = signal<string[]>([]);
  readonly produtosSelecionados = signal<(ProdutoResumidoDto | null)[]>([]);
  readonly itensOriginaisCount = signal(0);
  readonly isAdmin = computed(() => this.auth.currentUser()?.role === Perfil.Administrador);

  readonly revendedorControl = new FormControl<{ id: string; nome: string } | null>(null);

  readonly displayProduto = (produto: ProdutoResumidoDto | null): string =>
    produto ? produto.descricao : '';
  readonly displayRevendedor = (r: { id: string; nome: string } | null): string => r?.nome ?? '';
  readonly loadProdutosFn = (pagina: number, busca: string) =>
    this.estoqueService.listarProdutos(busca || undefined, pagina, 10);
  readonly loadRevendedoresFn = (pagina: number, busca: string) =>
    this.usuarioService.listarRevendedoresPaginado(pagina, busca);

  readonly form = this.fb.group({
    descricao: ['', [Validators.required, Validators.maxLength(200)]],
    idUsuario: ['' as string, Validators.required],
    itens: this.fb.array([], aoMenosUmItem),
  });

  get itens(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.maletaId = Number(idParam);
      this.modoEdicao.set(true);
      this.carregando.set(true);
      this.service.obterPorId(this.maletaId).subscribe({
        next: (maleta) => {
          this.revendedorControl.setValue({ id: maleta.idUsuario, nome: maleta.nomeUsuario });
          this.form.patchValue({ descricao: maleta.descricao, idUsuario: maleta.idUsuario });
          this.itensOriginaisCount.set(maleta.itens.length);
          maleta.itens.forEach(item => {
            const maxOriginal = item.quantidadeGeral + item.quantidade;
            const group = this.fb.group({
              idProduto: [item.idProduto, Validators.required],
              quantidade: [item.quantidade, [Validators.required, Validators.min(0), Validators.max(maxOriginal)]],
            });
            group.get('idProduto')?.disable();
            this.itens.push(group);
            this.produtosOriginaisDisplay.update(arr => [...arr, item.descricao]);
            this.produtosSelecionados.update(arr => [
              ...arr,
              { id: item.idProduto, descricao: item.descricao, quantidade: maxOriginal },
            ]);
          });
          if (maleta.itens.length === 0) this.adicionarItem();
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });
    } else {
      this.adicionarItem();
    }
  }

  onRevendedorSelecionado(r: { id: string }): void {
    this.form.get('idUsuario')?.setValue(r.id);
  }

  onRevendedorLimpo(): void {
    this.form.get('idUsuario')?.setValue('');
  }

  adicionarItem(): void {
    this.itens.push(
      this.fb.group({
        idProduto: [null, Validators.required],
        quantidade: [null, [Validators.required, Validators.min(1)]],
      })
    );
    this.produtosOriginaisDisplay.update(arr => [...arr, '']);
    this.produtosSelecionados.update(arr => [...arr, null]);
  }

  removerItem(index: number): void {
    if (this.modoEdicao() && index < this.itensOriginaisCount()) return;
    if (this.itens.length > 1) {
      this.itens.removeAt(index);
      this.produtosOriginaisDisplay.update(arr => arr.filter((_, i) => i !== index));
      this.produtosSelecionados.update(arr => arr.filter((_, i) => i !== index));
    }
  }

  limparProdutoLinha(index: number): void {
    this.itens.at(index).get('idProduto')?.setValue(null);
    const qtdCtrl = this.itens.at(index).get('quantidade');
    qtdCtrl?.setValidators([Validators.required, Validators.min(1)]);
    qtdCtrl?.updateValueAndValidity();
    this.produtosSelecionados.update(arr => arr.map((e, i) => i === index ? null : e));
  }

  produtosSelecionadosExceto(index: number): number[] {
    return this.produtosSelecionados()
      .map((p, i) => i !== index ? (p?.id as number | null) ?? null : null)
      .filter((id): id is number => id !== null);
  }

  selecionarProduto(index: number, produto: ProdutoResumidoDto): void {
    this.itens.at(index).get('idProduto')?.setValue(produto.id);
    const qtdCtrl = this.itens.at(index).get('quantidade');
    qtdCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(produto.quantidade)]);
    qtdCtrl?.updateValueAndValidity();
    this.produtosSelecionados.update(arr => arr.map((e, i) => i === index ? produto : e));
  }

  confirmar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);

    const raw = this.form.getRawValue();
    const dto = {
      descricao: raw.descricao!,
      idUsuario: raw.idUsuario!,
      itens: this.itens.getRawValue() as { idProduto: number; quantidade: number }[],
    };

    const onError = (e: { error?: { erros?: string[] } }) => {
      const erros: string[] = e?.error?.erros ?? ['Erro ao salvar. Tente novamente.'];
      this.snackBar.open(erros.join('\n'), 'Fechar', { duration: 6000, panelClass: ['snack-error'] });
      this.salvando.set(false);
    };

    if (this.modoEdicao() && this.maletaId) {
      this.service.editar(this.maletaId, dto).subscribe({
        next: () => {
          this.snackBar.open('Maleta atualizada com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/maletas']);
        },
        error: onError,
      });
    } else {
      this.service.criar(dto).subscribe({
        next: () => {
          this.snackBar.open('Maleta criada com sucesso!', 'Fechar', { duration: 3000 });
          this.router.navigate(['/maletas']);
        },
        error: onError,
      });
    }
  }
}
