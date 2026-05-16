import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { VendaService, FormaPagamentoDto } from '../../../core/services/venda.service';
import { ClientesService, ClientesDto } from '../../../core/services/clientes.service';

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
  ],
  templateUrl: './form-venda.html',
})
export class FormVendaComponent implements OnInit, OnDestroy {
  private readonly service = inject(VendaService);
  private readonly clientesService = inject(ClientesService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();

  readonly carregando = signal(true);
  readonly clientesOpcoes = signal<ClientesDto[]>([]);
  readonly formasPagamento = signal<FormaPagamentoDto[]>([]);

  readonly clienteControl = new FormControl<ClientesDto | string | null>(null, Validators.required);

  readonly form = this.fb.group({
    idTipoPagamento: [null as number | null, Validators.required],
  });

  readonly displayCliente = (c: ClientesDto | string | null): string =>
    c && typeof c === 'object' ? c.nome : '';

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

    this.clientesService.listar(1, 10).subscribe(res => this.clientesOpcoes.set(res.items));

    this.service.listarFormasPagamento().subscribe({
      next: (formas) => {
        this.formasPagamento.set(formas);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
