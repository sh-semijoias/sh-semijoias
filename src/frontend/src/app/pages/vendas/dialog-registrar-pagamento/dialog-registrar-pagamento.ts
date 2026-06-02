import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { VendaService, ParcelaVendaDto } from '../../../core/services/venda.service';

export interface DialogRegistrarPagamentoData {
  idVenda: number;
  nomeCliente: string;
}

export interface DialogRegistrarPagamentoResult {
  idParcela: number;
  dataPagamento: string;
}

@Component({
  selector: 'app-dialog-registrar-pagamento',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './dialog-registrar-pagamento.html',
})
export class DialogRegistrarPagamentoComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<DialogRegistrarPagamentoComponent>);
  readonly data: DialogRegistrarPagamentoData = inject(MAT_DIALOG_DATA);
  private readonly vendaService = inject(VendaService);

  readonly parcelas = signal<ParcelaVendaDto[]>([]);
  readonly carregando = signal(true);

  readonly parcelaControl = new FormControl<number | null>(null, [Validators.required]);
  readonly dataPagamentoControl = new FormControl<Date>(new Date(), {
    nonNullable: true,
    validators: [Validators.required],
  });

  ngOnInit(): void {
    this.vendaService.listarParcelas(this.data.idVenda).subscribe({
      next: (lista) => {
        this.parcelas.set(lista);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }

  confirmar(): void {
    if (this.parcelaControl.invalid || this.parcelaControl.value == null) return;
    if (this.dataPagamentoControl.invalid) return;

          console.log(this.dataPagamentoControl.value);

    this.dialogRef.close({
      idParcela: this.parcelaControl.value,
      dataPagamento: this.dataPagamentoControl.value.toISOString(),

    });
  }

}

