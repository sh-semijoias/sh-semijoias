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
import { environment } from '../../../../environments/environment';
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
  readonly previews = signal<(string | null)[]>([]);


getImagem(path: string | null): string {

  if (!path) return '';

  if (path.startsWith('data:image')) {
    return path;
  }

const url = environment.apiUrl + path;


  return url;
}


private carregarVenda(id: number): void {


  this.service.obterPorId(id).subscribe({

    next: venda => {

      // Dados principais
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

      // Limpa estruturas
  this.itens.clear();
this.produtosSelecionados.set([]);
this.produtoControls.set([]);
this.previews.set([]);

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

  this.previews.update(arr => {
    arr[indice] = item.fotoPath ?? null;
    return [...arr];
  });

  console.log("Foto recebida:", item.fotoPath);
console.log("Preview:", this.previews());

});

if (this.modoVisualizacao()) {
  this.form.disable();
  this.clienteControl.disable();
  this.revendedorControl.disable();
  this.produtoControls().forEach(c => c.disable());
}

this.recalcularTotal();

      if (this.modoVisualizacao()) {

        this.form.disable();
        this.clienteControl.disable();
        this.revendedorControl.disable();

        this.produtoControls().forEach(c => c.disable());
      }

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

  console.log('LOAD PRODUTOS EXECUTADO');

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

    console.log('REVENDEDOR SELECIONADO');
  console.log(r);

  this.form.get('idUsuario')?.setValue(r.id.toString());



  console.log(
    'ID USUARIO APOS SETVALUE:',
    this.form.get('idUsuario')?.value
  );

  this.produtosSelecionados.set([]);

  this.produtoControls().forEach(ctrl => ctrl.setValue(null));

this.itens.controls.forEach(grupo => {

  grupo.get('idEstoque')?.setValue(null);
  grupo.get('idProduto')?.setValue(null);
  grupo.get('quantidade')?.setValue(null);
  grupo.get('precoVendaReal')?.setValue('');

});

}

onRevendedorLimpo(): void {


  console.error('REVENDEDOR LIMPO');

  console.trace();

  this.form.get('idUsuario')?.setValue('');
}


  ngOnInit(): void {

    this.form.get('idUsuario')?.valueChanges.subscribe(v => {
  console.log('IDUSUARIO ALTERADO:', v);

  console.trace();
});

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
      precoVendaReal: [''],
      foto: [null]
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

          console.log('PRODUTO SELECIONADO');
  console.log(produto);

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

  itens: (this.itens.getRawValue() as any[]).map(i => ({
    idEstoque: i.idEstoque,
    quantidade: i.quantidade,
    precoVendaReal: this.parseMoeda(i.precoVendaReal) ?? 0
  }))
};

console.log('DTO ENVIADO');
console.log(dto);

console.log(JSON.stringify(dto));

const formData = new FormData();

formData.append(
    'dadosVenda',
    JSON.stringify(dto)
);

this.itens.controls.forEach(grupo => {

    const foto = grupo.get('foto')?.value;

    if (foto) {
        formData.append(
            'arquivos',
            foto,
            foto.name
        );
    }

});

for (const item of formData.entries()) {
  console.log(item);
}

    this.service.criar(formData).subscribe({
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

onFotoSelecionada(event: Event, index: number): void {

  console.log("Entrou no método");

  const input = event.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  const arquivo = input.files[0];

  // SALVA O ARQUIVO NO FORMGROUP
  this.itens.at(index).get('foto')?.setValue(arquivo);

  console.log("Arquivo salvo:", arquivo);

  const reader = new FileReader();

  reader.onload = () => {

    this.previews.update(arr => {
      arr[index] = reader.result as string;
      return [...arr];
    });

    console.log("Preview:", this.previews());
  };

  reader.readAsDataURL(arquivo);
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
