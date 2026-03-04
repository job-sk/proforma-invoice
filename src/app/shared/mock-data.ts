export const vendors = [
    { id: 1, name: 'ABC Supplier' },
    { id: 2, name: 'Global Traders' }
];

export const paymentTerms = [
    'Net 15',
    'Net 30',
    'Net 60'
];

export const taxGroups = [
    { id: 1, name: 'VAT 5%', rate: 0.05 }
];

export const invoiceItemsMock = [
    {
        item: 'Design Services',
        description: 'UX/UI design for web dashboard',
        unit: 'hours',
        qty: 10,
        price: 75
    },
    {
        item: 'Development',
        description: 'Frontend implementation (Angular)',
        unit: 'hours',
        qty: 20,
        price: 90
    },
    {
        item: 'Cloud Hosting',
        description: 'Application hosting and bandwidth',
        unit: 'month',
        qty: 1,
        price: 250
    }
];