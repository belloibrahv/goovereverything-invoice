import Dexie, { type EntityTable } from 'dexie';
import type { Document, Customer, CompanySettings, SerialCounter } from '@/types';

const db = new Dexie('GoovereverythingDB') as Dexie & {
  documents: EntityTable<Document, 'id'>;
  customers: EntityTable<Customer, 'id'>;
  settings: EntityTable<CompanySettings, 'id'>;
  serialCounters: EntityTable<SerialCounter, 'id'>;
};

db.version(1).stores({
  documents: '++id, serialNumber, type, status, createdAt',
  customers: '++id, name, email, phone',
  settings: '++id',
  serialCounters: '++id, type, year',
});

export { db };

// Initialize default company settings
export async function initializeSettings(): Promise<CompanySettings> {
  try {
    const existing = await db.settings.toArray();
    if (existing.length > 0) return existing[0];

    const defaultSettings: CompanySettings = {
      name: 'GOOVEREVERYTHING',
      address: 'Lagos, Nigeria',
      phone: '+234 XXX XXX XXXX',
      email: 'info@goovereverything.com',
      accountNumber: 'XXXXXXXXXX',
      bankName: 'Your Bank Name',
      taxRate: 7.5, // Nigerian VAT
      defaultCurrency: 'NGN',
    };

    const id = await db.settings.add(defaultSettings);
    return { ...defaultSettings, id };
  } catch (error) {
    console.error('Failed to initialize settings:', error);
    // Return default settings even if DB fails
    return {
      name: 'GOOVEREVERYTHING',
      address: 'Lagos, Nigeria',
      phone: '+234 XXX XXX XXXX',
      email: 'info@goovereverything.com',
      accountNumber: 'XXXXXXXXXX',
      bankName: 'Your Bank Name',
      taxRate: 7.5,
      defaultCurrency: 'NGN',
    };
  }
}

// Generate unique serial number
export async function generateSerialNumber(type: Document['type']): Promise<string> {
  const year = new Date().getFullYear();
  const prefixes = { invoice: 'INV', quotation: 'QUO', waybill: 'WBL' };
  const prefix = prefixes[type];

  try {
    let counter = await db.serialCounters.where({ type, year }).first();

    if (!counter) {
      counter = { type, prefix, currentNumber: 0, year };
      counter.id = await db.serialCounters.add(counter);
    }

    const newNumber = counter.currentNumber + 1;
    await db.serialCounters.update(counter.id!, { currentNumber: newNumber });

    return `${prefix}-${year}-${String(newNumber).padStart(5, '0')}`;
  } catch (error) {
    console.error('Failed to generate serial number:', error);
    // Fallback to timestamp-based serial
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}-${year}-${timestamp}`;
  }
}
