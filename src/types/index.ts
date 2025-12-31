export type DocumentType = 'invoice' | 'quotation' | 'waybill';

export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Customer {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
}

export interface Document {
  id?: number;
  serialNumber: string;
  type: DocumentType;
  customer: Customer;
  items: LineItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: Currency;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
}

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency?: Currency;
}

export interface CompanySettings {
  id?: number;
  name: string;
  regNumber?: string; // New field
  address: string;
  phone: string;
  email: string;
  bankAccounts: BankAccount[];
  logo?: string;
  taxRate: number;
  defaultCurrency: Currency;
}

export interface SerialCounter {
  id?: number;
  type: DocumentType;
  prefix: string;
  currentNumber: number;
  year: number;
}
