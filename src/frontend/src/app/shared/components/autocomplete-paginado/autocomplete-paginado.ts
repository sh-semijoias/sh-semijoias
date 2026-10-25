import { Component, HostBinding, Input, Output, OnInit, OnDestroy, OnChanges, SimpleChanges, EventEmitter, signal, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocomplete, MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, Subject, fromEvent, merge } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { input } from '@angular/core';

@Component({
  selector: 'app-autocomplete-paginado',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './autocomplete-paginado.html',
})
export class AutocompletePaginadoComponent implements OnInit, OnDestroy, OnChanges {
  @Input() reloadToken: unknown;
  @Input({ required: true }) label!: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input({ required: true }) loadFn!: (pagina: number, busca: string) => Observable<{ items: any[]; total: number }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input({ required: true }) displayFn!: (item: any) => string;
  @Input() placeholder = '';
  @Input() control?: AbstractControl;
  excluirIds = input<(string | number)[]>([]);
  @Input() hasError = false;
  @Input() errorMessage = '';
  @Input() fieldClass = '';
  @Input() subscriptSizing: 'fixed' | 'dynamic' = 'fixed';
  @Input() floatLabel: 'auto' | 'always' = 'auto';


  @HostBinding('class') get hostClass(): string { return 'block ' + this.fieldClass; }

  @Output() readonly selecionado = new EventEmitter<{ id: string | number }>();
  @Output() readonly limpo = new EventEmitter<void>();

  readonly opcoes = signal<{ id: string | number }[]>([]);
  readonly total = signal(0);
  readonly carregando = signal(false);
  readonly carregandoMais = signal(false);
  readonly opcoesFiltradas = computed(() =>
    this.opcoes().filter(o => !this.excluirIds().includes(o.id))
  );

  readonly internalControl = new FormControl<unknown>(null);

  get effectiveControl(): AbstractControl {
    return this.control ?? this.internalControl;
  }

  private buscaAtual = '';
  private readonly panelAberto$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();


  ngOnChanges(changes: SimpleChanges) {

  if (changes['reloadToken']) {

    this.buscaAtual = '';

    this.carregarPagina(1, '');

  }

}

  ngOnInit(): void {

      console.log('CRIADO:', this.label);

    this.effectiveControl.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    )

.subscribe(valor => {
  if (typeof valor === 'string') {
    this.buscaAtual = valor;
    this.carregarPagina(1, valor);
  } else if (valor) {
    this.opcoes.set([valor as { id: string | number }]);
  }
});

    this.carregarPagina(1, '');
  }

  ngOnDestroy(): void {

      console.log('DESTRUIDO:', this.label);

    this.panelAberto$.next();
    this.destroy$.next();
    this.destroy$.complete();
  }


  onFocus(): void {

      console.log('FOCUS');

  if (this.opcoes().length === 0) {
    this.buscaAtual = '';
    this.carregarPagina(1, '');
  }
}

onPanelAberto(auto: MatAutocomplete): void {

    console.log('PANEL ABERTO');
  console.log('OPCOES ATUAIS', this.opcoes());

    if (this.effectiveControl.disabled) {
    return;
  }

  if (this.opcoes().length === 0) {
    this.carregarPagina(1, '');
  }

  this.panelAberto$.next();

  setTimeout(() => {
    const panel = auto.panel?.nativeElement;
    if (!panel) return;

    fromEvent(panel, 'scroll').pipe(
      takeUntil(merge(this.panelAberto$, this.destroy$))
    ).subscribe(() => {
      if (panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 50) {
        this.carregarMais();
      }
    });
  });
}

  carregarMais(): void {
    if (this.carregandoMais() || this.opcoes().length >= this.total()) return;
    const proximaPagina = Math.floor(this.opcoes().length / 10) + 1;
    this.carregandoMais.set(true);
    this.loadFn(proximaPagina, this.buscaAtual).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.opcoes.update(arr => [...arr, ...res.items]);
        this.total.set(res.total);
        this.carregandoMais.set(false);
      },
      error: () => this.carregandoMais.set(false),
    });
  }



limpar(): void {

  console.log('BOTAO X CLICADO:', this.label);

  this.effectiveControl.setValue(null);

  this.buscaAtual = '';

  this.carregarPagina(1, '');

  this.limpo.emit();
}

  onOpcaoSelecionada(opcao: { id: string | number }): void {
    if (this.control) this.control.setValue(opcao);
    this.selecionado.emit(opcao);
  }

  private carregarPagina(pagina: number, busca: string): void {

      console.log('CARREGAR PAGINA', pagina, busca);

    this.carregando.set(true);
    this.loadFn(pagina, busca).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {

    console.log('ANTES SET');
    console.log(this.opcoes());

    this.opcoes.set(res.items);

    console.log('DEPOIS SET');
    console.log(this.opcoes());

        this.total.set(res.total);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }
}
