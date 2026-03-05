export interface InvoiceItem {
    item: string;
    description: string;
    unit: string;
    qty: number;
    price: number;
    amount: number;
    allocatedExpense: number;
}

export interface Invoice {
    invoiceNo: string;
    vendor: string;
    date: string;
    taxGroup: string;
    paymentTerms: string;
    subtotal: number;
    tax: number;
    total: number;
    totalExpense: number;
    items: InvoiceItem[];
}

export interface SavePayload {
    invoice: Invoice;
    items: InvoiceItem[];
}