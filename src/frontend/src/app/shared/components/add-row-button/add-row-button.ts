import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-row-button',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './add-row-button.html',
})
export class AddRowButtonComponent {
  @Input() label = 'Adicionar item';
  @Output() clicked = new EventEmitter<void>();
}
