import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Invoice } from './features/invoice/invoice';

@Component({
  selector: 'app-root',
  imports: [MatIconModule, Invoice],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('proforma-invoice');
}
