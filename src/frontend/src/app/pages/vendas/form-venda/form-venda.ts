import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, FormControl, FormArray,
  Validators, AbstractControl, ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { NgxMaskDirective } from 'ngx-mask';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { VendaService, FormaPagamentoDto } from '../../../core/services/venda.service';
import { EstoqueService, EstoqueDto } from '../../../core/services/estoque.service';
import { ClientesService, ClientesDto } from '../../../core/services/clientes.service';
import { AddRowButtonComponent } from '../../../shared/components/add-row-button/add-row-button';

function aoMenosUmItem(control: AbstractControl): ValidationErrors | null {
  const array = control as FormArray;
  return array.length > 0 ? null : { semItens: true };
}

interface EstadoLinha {
  displayValue: string;
  total: number;
  produtos: EstoqueDto[];
  carregando: boolean;
  produtoSelecionado: EstoqueDto | null;
}

@Component({
  selector: 'app-form-venda',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    NgxMaskDirective,
    AddRowButtonComponent,
    CurrencyPipe,
  ],
  templateUrl: './form-venda.html',
})
export class FormVendaComponent implements OnInit, OnDestroy {
  private readonly service = inject(VendaService);
  private readonly estoqueService = inject(EstoqueService);
  private readonly clientesService = inject(ClientesService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private readonly busca$ = new Subject<{ index: number; busca: string }>();

  readonly carregando = signal(true);
  readonly clientesOpcoes = signal<ClientesDto[]>([]);
  readonly formasPagamento = signal<FormaPagamentoDto[]>([]);
  readonly estadoLinhas = signal<EstadoLinha[]>([]);
  readonly total = signal(0);

  readonly clienteControl = new FormControl<ClientesDto | string | null>(null, Validators.required);

  readonly form = this.fb.group({
    idTipoPagamento: [null as number | null, Validators.required],
    itens: this.fb.array([], aoMenosUmItem),
  });

  get itens(): FormArray {
    return this.form.get('itens') as FormArray;
  }

  readonly displayCliente = (c: ClientesDto | string | null): string =>
    c && typeof c === 'object' ? c.nome : '';

  readonly displayProduto = (p: EstoqueDto | null): string =>
    p ? p.produto : '';

  ngOnInit(): void {
    this.clienteControl.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(valor => {
      if (typeof valor === 'string') {
        this.clientesService.listar(1, 10, valor || undefined)
          .subscribe(res => this.clientesOpcoes.set(res.items));
      }
    });

    this.busca$.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => a.index === b.index && a.busca === b.busca),
      takeUntil(this.destroy$)
    ).subscribe(({ index, busca }) => this.carregarProdutosLinha(index, busca));

    this.itens.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.recalcularTotal());

    this.clientesService.listar(1, 10).subscribe(res => this.clientesOpcoes.set(res.items));

    this.service.listarFormasPagamento().subscribe({
      next: (formas) => {
        this.formasPagamento.set(formas);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });

    this.adicionarItem();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  adicionarItem(): void {
    const index = this.itens.length;
    this.itens.push(
      this.fb.group({
        idEstoque: [null as number | null, Validators.required],
        idProduto: [null as number | null],
        quantidade: [null as number | null, [Validators.required, Validators.min(1)]],
        precoVendaReal: ['', Validators.required],
      })
    );
    this.estadoLinhas.update(arr => [
      ...arr,
      { displayValue: '', total: 0, produtos: [], carregando: false, produtoSelecionado: null },
    ]);
    this.carregarProdutosLinha(index, '');
  }

  removerItem(index: number): void {
    if (this.itens.length > 1) {
      this.itens.removeAt(index);
      this.estadoLinhas.update(arr => arr.filter((_, i) => i !== index));
      this.recalcularTotal();
    }
  }

  carregarProdutosLinha(index: number, busca: string): void {
    this.estadoLinhas.update(arr =>
      arr.map((e, i) => i === index ? { ...e, carregando: true } : e)
    );
    this.estoqueService.listar({ pagina: 1, tamanhoPagina: 10, busca: busca || undefined, emEstoque: true })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.estadoLinhas.update(arr =>
            arr.map((e, i) => i === index
              ? { ...e, carregando: false, produtos: res.items, total: res.total }
              : e)
          );
        },
        error: () => {
          this.estadoLinhas.update(arr =>
            arr.map((e, i) => i === index ? { ...e, carregando: false } : e)
          );
        },
      });
  }

  atualizarDisplay(index: number, evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.estadoLinhas.update(arr =>
      arr.map((e, i) => i === index ? { ...e, displayValue: valor } : e)
    );
    if (!valor) {
      const grupo = this.itens.at(index);
      grupo.get('idEstoque')?.setValue(null);
      grupo.get('idProduto')?.setValue(null);
      const qtdCtrl = grupo.get('quantidade');
      qtdCtrl?.setValidators([Validators.required, Validators.min(1)]);
      qtdCtrl?.updateValueAndValidity();
      this.estadoLinhas.update(arr =>
        arr.map((e, i) => i === index ? { ...e, produtoSelecionado: null } : e)
      );
    }
    this.busca$.next({ index, busca: valor });
  }

  produtosSelecionadosExceto(index: number): number[] {
    return this.itens.controls
      .map((c, i) => i !== index ? c.get('idEstoque')?.value as number | null : null)
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
    this.estadoLinhas.update(arr =>
      arr.map((e, i) => i === index ? { ...e, displayValue: produto.produto, produtoSelecionado: produto } : e)
    );
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
