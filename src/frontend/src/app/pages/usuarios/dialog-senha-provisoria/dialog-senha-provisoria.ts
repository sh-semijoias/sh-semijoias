import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Clipboard } from '@angular/cdk/clipboard';

export interface DialogSenhaProvisoriaData {
  nomeUsuario: string;
  senhaProvisoria: string;
}

@Component({
  selector: 'app-dialog-senha-provisoria',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './dialog-senha-provisoria.html',
})
export class DialogSenhaProvisoriaComponent {
  readonly data: DialogSenhaProvisoriaData = inject(MAT_DIALOG_DATA);
  private readonly clipboard = inject(Clipboard);

  readonly copiado = signal(false);

  copiar(): void {
    this.clipboard.copy(this.data.senhaProvisoria);
    this.copiado.set(true);
    setTimeout(() => this.copiado.set(false), 2000);
  }
}
