import Dexie, { type EntityTable } from 'dexie';
import type { Document, Customer, CompanySettings, SerialCounter, BankAccount } from '@/types';

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

// Migrate old settings format to new format with bankAccounts array
function migrateSettings(settings: any): CompanySettings {
  // If already has bankAccounts array, return as is
  if (settings.bankAccounts && Array.isArray(settings.bankAccounts) && settings.bankAccounts.length > 0) {
    return settings as CompanySettings;
  }

  // Migrate from old format (bankName, accountNumber) to new format (bankAccounts array)
  const bankAccounts: BankAccount[] = [];
  
  if (settings.bankName || settings.accountNumber) {
    bankAccounts.push({
      bankName: settings.bankName || 'Your Bank',
      accountName: settings.name || 'Account Name',
      accountNumber: settings.accountNumber || '',
      currency: settings.defaultCurrency || 'NGN',
    });
  } else {
    // No bank info at all, add default placeholder
    bankAccounts.push({
      bankName: 'First Bank',
      accountName: settings.name || 'GOOVEREVERYTHING LTD',
      accountNumber: '0123456789',
      currency: 'NGN',
    });
  }

  return {
    id: settings.id,
    name: settings.name || 'GOOVEREVERYTHING',
    address: settings.address || 'Lagos, Nigeria',
    phone: settings.phone || '+234 XXX XXX XXXX',
    email: settings.email || 'info@goovereverything.com',
    bankAccounts,
    taxRate: settings.taxRate ?? 7.5,
    defaultCurrency: settings.defaultCurrency || 'NGN',
  };
}

// Initialize default company settings
export async function initializeSettings(): Promise<CompanySettings> {
  try {
    const existing = await db.settings.toArray();
    
    if (existing.length > 0) {
      // Migrate existing settings if needed
      const migrated = migrateSettings(existing[0]);
      
      // Save migrated settings back to DB if changed
      if (!existing[0].bankAccounts || existing[0].bankAccounts.length === 0) {
        await db.settings.put(migrated);
      }
      
      return migrated;
    }

    // Create new default settings
    const defaultSettings: CompanySettings = {
      name: 'GOOVEREVERYTHING',
      address: 'Lagos, Nigeria',
      phone: '+234 XXX XXX XXXX',
      email: 'info@goovereverything.com',
      bankAccounts: [
        {
          bankName: 'First Bank',
          accountName: 'GOOVEREVERYTHING LTD',
          accountNumber: '0123456789',
          currency: 'NGN',
        },
      ],
      taxRate: 7.5,
      defaultCurrency: 'NGN',
    };

    const id = await db.settings.add(defaultSettings);
    return { ...defaultSettings, id };
  } catch (error) {
    console.error('Failed to initialize settings:', error);
    return {
      name: 'GOOVEREVERYTHING',
      address: 'Lagos, Nigeria',
      phone: '+234 XXX XXX XXXX',
      email: 'info@goovereverything.com',
      bankAccounts: [
        {
          bankName: 'First Bank',
          accountName: 'GOOVEREVERYTHING LTD',
          accountNumber: '0123456789',
          currency: 'NGN',
        },
      ],
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
    const timestamp = Date.now().toString(36).toUpperCase();
    return `${prefix}-${year}-${timestamp}`;
  }
}
