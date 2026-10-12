import { Component } from '@angular/core';
import { DashboardFiltrosService } from './dashboard-filtros.service';
import { CardTicketMedioComponent } from './cards/ticket-medio/ticket-medio';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardTicketMedioComponent],
  providers: [DashboardFiltrosService],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {}
