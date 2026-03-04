import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { vendors, paymentTerms, taxGroups, invoiceItemsMock } from '../../shared/mock-data';
import { DecimalPipe } from '@angular/common';
import { ExpenseAllocation } from '../../core/services/expense-allocation';
import { InvoiceItem } from '../../core/models/invoice.model';
import { distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-invoice',
  imports: [ReactiveFormsModule, MatIconModule, DecimalPipe],
  templateUrl: './invoice.html',
  styleUrl: './invoice.scss',
})
export class Invoice implements OnInit{
  
  formBuilder = inject(FormBuilder);
  expenseService = inject(ExpenseAllocation);
  destroyRef = inject(DestroyRef);

  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  invoiceForm = this.formBuilder.group({
    invoiceNo: ['', Validators.required],
    vendor: ['', Validators.required],
    date: [''],
    taxGroup: [taxGroups[0], Validators.required],
    paymentTerms: ['', Validators.required],
    totalExpense: [null, [Validators.required, Validators.min(0.01)]],
    notes: [''],
    items: this.formBuilder.array([])
  });
  
  vendors = vendors;
  paymentTerms = paymentTerms;
  taxGroups = taxGroups;

  displayedColumns = [
    'item',
    'description',
    'unit',
    'qty',
    'price',
    'amount',
    'expense',
    'actions'
  ];

  dataSource: any[] = [];

  subTotal = signal(0);

  tax = computed(() => {
    const rate = (this.invoiceForm.value.taxGroup?.rate as number) || 0;
    return Number((this.subTotal() * rate).toFixed(2));
  });

  total = computed(() => Number((this.subTotal() + this.tax()).toFixed(2)));

  constructor() {
    // Prefill with mock line items when available
    if (invoiceItemsMock?.length) {
      invoiceItemsMock.forEach((item) => this.addRow(item));
    } else {
      this.addRow();
    }
  }

  ngOnInit() {
    console.log('items',this.invoiceForm.controls.items.value);
  }

  get items(): FormArray {
    // return this.invoiceForm.get('items') as FormArray;
    return this.invoiceForm.controls.items as FormArray;
  }

  addRow(initial?: Partial<InvoiceItem>) {
    const row = this.formBuilder.group({
      item: [initial?.item ?? '', Validators.required],
      description: [initial?.description ?? ''],
      unit: [initial?.unit ?? ''],
      qty: [initial?.qty ?? 1, [Validators.required, Validators.min(1)]],
      price: [initial?.price ?? null, [Validators.required, Validators.min(0.01)]],
      amount: [0],
      expense: [0]
    });
  
    // // listen only to fields that affect calculation
    // row.get('qty')?.valueChanges.subscribe(() => {
    //   this.calculateAmounts();
    // });
  
    // row.get('price')?.valueChanges.subscribe(() => {
    //   this.calculateAmounts();
    // });
    row.get('qty')?.valueChanges
    .pipe(distinctUntilChanged(),takeUntilDestroyed(this.destroyRef))
    .subscribe(() => this.calculateRow(row));

    row.get('price')?.valueChanges
      .pipe(distinctUntilChanged(),takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.calculateRow(row));
  
    this.items.push(row);
    this.refreshTable();
  
    this.calculateAmounts();
  }

  removeRow(index: number) {
    this.items.removeAt(index);
    this.refreshTable();
    this.calculateAmounts();
  }

  calculateRow(row: FormGroup) {
    const qty = Number(row.value.qty || 0);
    const price = Number(row.value.price || 0);
  
    row.patchValue({
      amount: qty * price
    }, { emitEvent:false });
  
    this.calculateAmounts();
  }

  calculateAmounts() {
    const items: InvoiceItem[] = this.items.controls.map(control => {
      const raw = control.value as Partial<InvoiceItem>;

      const qty = Number(raw.qty ?? 0);
      const price = Number(raw.price ?? 0);
      const amount = qty * price;

      if (raw.amount !== amount) {
        control.patchValue(
          { amount },
          { emitEvent: false }
        );
      }

      return {
        item: raw.item ?? '',
        description: raw.description ?? '',
        unit: raw.unit ?? '',
        qty,
        price,
        amount,
        expense: raw.expense ?? 0
      };

    });

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    this.subTotal.set(subtotal);

    const totalExpense = this.invoiceForm.value.totalExpense || 0;

    const allocated: InvoiceItem[] = this.expenseService.allocateExpense( items, totalExpense );

    allocated.forEach((item, index) => {
      this.items.at(index).patchValue(
        { expense: item.expense },
        { emitEvent: false }
      );
    });
  }

  private refreshTable() {
    this.dataSource = [...this.items.controls];
  }

  sortBy(column: 'qty' | 'price') {
    if (this.items.length <= 1) {
      return;
    }

    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    const sortedControls = [...this.items.controls].sort((a, b) => {
      const aValue = Number(a.get(column)?.value || 0);
      const bValue = Number(b.get(column)?.value || 0);

      return this.sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });

    const formArray = this.items;
    formArray.clear();
    sortedControls.forEach(control => formArray.push(control));

    this.refreshTable();
  }

  clearAllItems() {
    this.items.clear();
    this.addRow();
    this.sortColumn = null;
    this.sortDirection = 'asc';
    this.calculateAmounts();
  }

  isFormValid(): boolean {
    return this.invoiceForm.valid && this.items.length > 0 && this.items.controls.every(c => c.valid);
  }

  exportJSON() {
    this.invoiceForm.markAllAsTouched();
    this.items.controls.forEach(c => c.markAllAsTouched());

    if (!this.isFormValid()) {
      alert('Please fill all the required fields');
      return;
    }

    const data = {
      ...this.invoiceForm.value,
      subtotal: this.subTotal(),
      tax: this.tax(),
      total: this.total()
    };
    console.log(data);

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: 'application/json' }
    );

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'invoice.json';
    link.click();
  }

}
