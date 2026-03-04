import { Injectable } from '@angular/core';
import { InvoiceItem } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseAllocation {

  allocateExpense(items: InvoiceItem[], totalExpense: number) {

    const totalAmount = items.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    if (!totalAmount || !totalExpense) {
      items.forEach(i => i.expense = 0);
      return items;
    }

    items.forEach(item => {

      const allocated =
        (item.amount / totalAmount) * totalExpense;

      item.expense = Number(allocated.toFixed(2));

    });

    return items;
  }
}