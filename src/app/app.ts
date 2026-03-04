import { Component, signal } from '@angular/core';
import { Invoice } from './features/invoice/invoice';

@Component({
  selector: 'app-root',
  imports: [Invoice],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('proforma-invoice');
}
