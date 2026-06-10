import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, FormControl, FormArray,
  Validators, AbstractControl, ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgxMaskDirective } from 'ngx-mask';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendaService, FormaPagamentoDto, CriarVendaDto } from '../../../core/services/venda.service';
import { EstoqueService, EstoqueDto } from '../../../core/services/estoque.service';
import { ClientesService, ClientesDto } from '../../../core/services/clientes.service';
import { AddRowButtonComponent } from '../../../shared/components/add-row-button/add-row-button';
import { AutocompletePaginadoComponent } from '../../../shared/components/autocomplete-paginado/autocomplete-paginado';
import { UsuarioService } from '../../../core/services/usuario.service';
import { computed } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Perfil } from '../../../core/enums/perfil.enum';
import { ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


function aoMenosUmItem(control: AbstractControl): ValidationErrors | null {
  const array = control as FormArray;
  return array.length > 0 ? null : { semItens: true };
}

@Component({
  selector: 'app-form-venda',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    NgxMaskDirective,
    AddRowButtonComponent,
    AutocompletePaginadoComponent,
    CurrencyPipe,

  ],
  templateUrl: './form-venda.html',
})


export class FormVendaComponent implements OnInit, OnDestroy {


  private readonly service = inject(VendaService);
  private readonly estoqueService = inject(EstoqueService);
  private readonly clientesService = inject(ClientesService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private readonly usuarioService = inject(UsuarioService);
  private readonly auth = inject(AuthService);
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly formasPagamento = signal<FormaPagamentoDto[]>([]);
  readonly produtosSelecionados = signal<(EstoqueDto | null)[]>([]);
  readonly total = signal(0);
  private readonly route = inject(ActivatedRoute);
  readonly produtoControls = signal<FormControl<EstoqueDto | null>[]>([]);

  readonly modoVisualizacao = signal(false);
private vendaId: number | null = null;

  readonly clienteControl = new FormControl<ClientesDto | string | null>(null, Validators.required);





private carregarVenda(id: number): void {
  this.service.obterPorId(id).subscribe({
    next: venda => {

      // Campos do FormGroup
      this.form.patchValue({
        idUsuario: venda.idUsuario,
        idTipoPagamento: venda.idTipoPagamento,
        totalParcelas: venda.totalParcelas,
        comentario: venda.comentario ?? ''
      });

      // Cliente
      this.clienteControl.setValue({
        id: venda.idCliente.toString(),
        nome: venda.nomeCliente,
        email: '',
        cpf: '',
        telefone: null
      });

      // Revendedor
this.revendedorControl.setValue({
  id: venda.idUsuario!,
  nome: venda.nomeRevendedora!
});

      // Limpa itens existentes
this.itens.clear();
this.produtosSelecionados.set([]);

venda.itens.forEach(item => {

  const grupo = this.fb.group({
    idEstoque: [item.idEstoque],
    idProduto: [item.idProduto],
    quantidade: [item.quantidade],
    precoVendaReal: [
      this.formatarMoeda(item.precoVendaReal)
    ]
  });

  this.itens.push(grupo);

  this.produtosSelecionados.update(arr => [
    ...arr,
    {
      id: item.idEstoque,
      idProduto: item.idProduto,
      produto: item.produto,
      quantidade: item.quantidade,
      precoCompra: 0,
      precoVendaSugerido: item.precoVendaReal,
      idTipoProduto: 0,
      tipo: ''
    } as EstoqueDto
  ]);
});

this.recalcularTotal();

      // modo somente leitura
this.itens.clear();
this.produtosSelecionados.set([]);
this.produtoControls.set([]);

venda.itens.forEach(item => {

  this.adicionarItem();

  const indice = this.itens.length - 1;

  this.itens.at(indice).patchValue({
    idEstoque: item.idEstoque,
    idProduto: item.idProduto,
    quantidade: item.quantidade,
    precoVendaReal: this.formatarMoeda(item.precoVendaReal)
  });

  const produto: EstoqueDto = {
    id: item.idEstoque,
    idProduto: item.idProduto,
    produto: item.produto,
    quantidade: item.quantidade,
    precoCompra: 0,
    precoVendaSugerido: item.precoVendaReal,
    idTipoProduto: 0,
    tipo: ''
  };

  this.produtosSelecionados.update(arr => {
    arr[indice] = produto;
    return [...arr];
  });

  this.produtoControls()[indice].setValue(produto);

  if (this.modoVisualizacao()) {
  this.form.disable();
  this.clienteControl.disable();
  this.revendedorControl.disable();

  this.produtoControls().forEach(c => c.disable());
}
});

this.recalcularTotal();

      console.log('VENDA RECEBIDA', venda);
    },
    error: erro => {
      console.error('ERRO AO BUSCAR VENDA', erro);
    }
  });
}

  readonly isAdmin = computed(  () => this.auth.currentUser()?.role === Perfil.Administrador
);

  readonly loadClientesFn = (pagina: number, busca: string) =>
    this.clientesService.listar(pagina, 10, busca || undefined);
readonly loadProdutosFn = (pagina: number, busca: string) => {

  console.log(
    'ID USUARIO NO LOADPRODUTOS:',
    this.form.get('idUsuario')?.value
  );

  return this.estoqueService.listar({
    pagina,
    tamanhoPagina: 10,
    busca: busca || undefined,
    emEstoque: true,
    idUsuario: this.form.get('idUsuario')?.value || undefined
  });
};

readonly revendedorControl =
  new FormControl<{ id: string; nome: string } | null>(null);

readonly displayRevendedor = (
  r: { id: string; nome: string } | null
): string => r?.nome ?? '';

readonly loadRevendedoresFn = (
  pagina: number,
  busca: string
) => this.usuarioService.listarRevendedoresPaginado(
  pagina,
  busca
);

  readonly form = this.fb.group({
      idUsuario: [''],
    idTipoPagamento: [null as number | null, Validators.required],
    totalParcelas: this.fb.control(
      { value: 1, disabled: true },
      { validators: [Validators.required, Validators.min(1), Validators.max(12)] }
    ),
    comentario: [''],
    itens: this.fb.array([], aoMenosUmItem),
  });

  get itens(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  readonly displayCliente = (c: ClientesDto | string | null): string =>
    c && typeof c === 'object' ? c.nome : '';

  readonly displayProduto = (p: EstoqueDto | null): string =>
    p ? p.produto : '';



onRevendedorSelecionado(r: { id: string | number }): void {

  this.form.get('idUsuario')?.setValue(r.id.toString());

  this.produtosSelecionados.set([]);

  // força os autocompletes a limparem os produtos selecionados
  this.itens.controls.forEach(grupo => {
    grupo.get('idEstoque')?.setValue(null);
    grupo.get('idProduto')?.setValue(null);
  });

  console.log('Revendedor selecionado:', r.id);
}

onRevendedorLimpo(): void {
  this.form.get('idUsuario')?.setValue('');
}


  ngOnInit(): void {
    this.itens.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.recalcularTotal());

    this.form.get('idTipoPagamento')!.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(id => this.aplicarRegraParcelamento(id));

    this.service.listarFormasPagamento().subscribe({
      next: (formas) => {
        this.formasPagamento.set(formas);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });

const idParam = this.route.snapshot.paramMap.get('id');

console.log('ID PARAM', idParam);

if (idParam) {
  this.vendaId = Number(idParam);
  this.modoVisualizacao.set(true);

  this.carregarVenda(this.vendaId);

  this.form.disable();
  this.clienteControl.disable();
  this.revendedorControl.disable();

  return;
}

    this.adicionarItem();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  limparProdutoLinha(index: number): void {
    const grupo = this.itens.at(index);
    grupo.get('idEstoque')?.setValue(null);
    grupo.get('idProduto')?.setValue(null);
    const qtdCtrl = grupo.get('quantidade');
    qtdCtrl?.setValidators([Validators.required, Validators.min(1)]);
    qtdCtrl?.updateValueAndValidity();
    this.produtosSelecionados.update(arr => arr.map((e, i) => i === index ? null : e));
  }

adicionarItem(): void {

  this.itens.push(
    this.fb.group({
      idEstoque: [null],
      idProduto: [null],
      quantidade: [null],
      precoVendaReal: ['']
    })
  );

  this.produtosSelecionados.update(arr => [...arr, null]);

  this.produtoControls.update(arr => [
    ...arr,
    new FormControl<EstoqueDto | null>(null)
  ]);
}

removerItem(index: number): void {

  this.itens.removeAt(index);

  this.produtosSelecionados.update(
    arr => arr.filter((_, i) => i !== index)
  );

  this.produtoControls.update(
    arr => arr.filter((_, i) => i !== index)
  );

  this.recalcularTotal();
}

  produtosSelecionadosExceto(index: number): number[] {
    return this.produtosSelecionados()
      .map((p, i) => i !== index ? (p?.id as number | null) ?? null : null)
      .filter((id): id is number => id !== null);
  }

  selecionarProduto(index: number, produto: EstoqueDto): void {
    const grupo = this.itens.at(index);
    grupo.get('idEstoque')?.setValue(produto.id);
    grupo.get('idProduto')?.setValue(produto.idProduto);
    grupo.get('precoVendaReal')?.setValue(this.formatarMoeda(produto.precoVendaSugerido));
    const qtdCtrl = grupo.get('quantidade');
    qtdCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(produto.quantidade)]);
    qtdCtrl?.updateValueAndValidity();
    this.produtosSelecionados.update(arr => arr.map((e, i) => i === index ? produto : e));
  }

  get parcelamentoHabilitado(): boolean {
    const id = this.form.get('idTipoPagamento')?.value;
    return this.formasPagamento().find(f => f.id === id)?.permiteParcelamento ?? false;
  }

  get resumoParcelas(): { numero: number; valor: number; valorUltima: number; uniforme: boolean } | null {
    const numero = this.form.get('totalParcelas')?.value ?? 1;
    const total = this.total();
    if (numero <= 1 || total <= 0) return null;
    const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;
    const valor = round2(total / numero);
    const valorUltima = round2(total - valor * (numero - 1));
    return { numero, valor, valorUltima, uniforme: valor === valorUltima };
  }

  private aplicarRegraParcelamento(idTipoPagamento: number | null): void {
    const ctrl = this.form.get('totalParcelas')!;
    const forma = this.formasPagamento().find(f => f.id === idTipoPagamento);
    if (forma?.permiteParcelamento) {
      ctrl.enable({ emitEvent: false });
    } else {
      ctrl.setValue(1, { emitEvent: false });
      ctrl.disable({ emitEvent: false });
    }
  }

  salvar(): void {
    const clienteSelecionado = this.clienteControl.value;
    const clienteValido = !!clienteSelecionado && typeof clienteSelecionado === 'object';
    if (this.form.invalid || !clienteValido) {
      this.form.markAllAsTouched();
      this.clienteControl.markAsTouched();
      return;
    }

    this.salvando.set(true);

    const cliente = clienteSelecionado as ClientesDto;
    const raw = this.form.getRawValue();
const dto: CriarVendaDto = {
  idCliente: Number(cliente.id),
  idUsuario: raw.idUsuario || undefined,
  idTipoPagamento: raw.idTipoPagamento!,
  totalParcelas: raw.totalParcelas!,
  comentario: raw.comentario?.trim() || undefined,
      itens: (this.itens.getRawValue() as { idEstoque: number; quantidade: number; precoVendaReal: string }[])
        .map(i => ({
          idEstoque: i.idEstoque,
          quantidade: i.quantidade,
          precoVendaReal: this.parseMoeda(i.precoVendaReal) ?? 0,
        })),
    };
console.log('DTO enviado', dto);
    this.service.criar(dto).subscribe({
      next: () => {
        this.snackBar.open('Venda registrada com sucesso!', 'Fechar', { duration: 3000 });
        this.router.navigate(['/vendas']);
      },
      error: (e: { error?: { erros?: string[] } }) => {
        const erros = e?.error?.erros ?? ['Erro ao salvar. Tente novamente.'];
        this.snackBar.open(erros.join('\n'), 'Fechar', { duration: 6000, panelClass: ['snack-error'] });
        this.salvando.set(false);
      },
    });
  }

  private recalcularTotal(): void {
    const soma = (this.itens.getRawValue() as { quantidade: number | null; precoVendaReal: string }[])
      .reduce((acc, item) => {
        const preco = this.parseMoeda(item.precoVendaReal);
        const qtd = item.quantidade ?? 0;
        return acc + (preco ?? 0) * qtd;
      }, 0);
    this.total.set(soma);
  }

  private parseMoeda(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const texto = value.toString().trim().replace(/\s|R\$/g, '');
    const normalizado = texto.includes(',')
      ? texto.replace(/\./g, '').replace(',', '.')
      : texto.replace(/,/g, '');
    const parsed = Number.parseFloat(normalizado);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private formatarMoeda(value: number): string {
    return value.toFixed(2).replace('.', ',');
  }
}
