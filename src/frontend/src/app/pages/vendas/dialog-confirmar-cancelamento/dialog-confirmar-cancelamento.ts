import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VendaService, MotivoCancelamentoDto } from '../../../core/services/venda.service';

export interface DialogConfirmarCancelamentoData {
  nomeCliente: string;
}

export interface DialogConfirmarCancelamentoResult {
  idMotivoCancelamentoVenda: number;
}

@Component({
  selector: 'app-dialog-confirmar-cancelamento',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-confirmar-cancelamento.html',
})
export class DialogConfirmarCancelamentoComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<DialogConfirmarCancelamentoComponent>);
  readonly data: DialogConfirmarCancelamentoData = inject(MAT_DIALOG_DATA);
  private readonly vendaService = inject(VendaService);

  readonly motivos = signal<MotivoCancelamentoDto[]>([]);
  readonly carregandoMotivos = signal(true);

  readonly motivoControl = new FormControl<number | null>(null, [Validators.required]);

  ngOnInit(): void {
    this.vendaService.listarMotivosCancelamento().subscribe({
      next: (lista) => {
        this.motivos.set(lista);
        this.carregandoMotivos.set(false);
      },
      error: () => this.carregandoMotivos.set(false),
    });
  }

  confirmar(): void {
    if (this.motivoControl.invalid || this.motivoControl.value == null) return;
    this.dialogRef.close({ idMotivoCancelamentoVenda: this.motivoControl.value });
  }
}
