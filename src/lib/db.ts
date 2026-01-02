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
      bankName: settings.bankName || 'FCMB',
      accountName: settings.name || 'SAMIDAK TECHNICAL AND ALLIED SERVICES',
      accountNumber: settings.accountNumber || '2002376450',
      currency: settings.defaultCurrency || 'NGN',
    });
  } else {
    // No bank info at all, add Samidak default
    bankAccounts.push({
      bankName: 'FCMB',
      accountName: 'SAMIDAK TECHNICAL AND ALLIED SERVICES',
      accountNumber: '2002376450',
      currency: 'NGN',
    });
  }

  // Check for placeholders or old defaults that need updating
  const isPlaceholderPhone = settings.phone === '+234 XXX XXX XXXX' || !settings.phone;
  const isOldEmail = settings.email === 'info@goovereverything.com' || settings.email === 'info@samidak.com' || !settings.email;
  const isOldName = settings.name === 'GOOVEREVERYTHING' || settings.name === 'SAMIDAK' || !settings.name;

  return {
    id: settings.id,
    name: isOldName ? 'SAMIDAK TECHNICAL AND ALLIED SERVICES' : settings.name,
    regNumber: settings.regNumber || 'RC 6891936',
    address: (settings.address === 'Lagos, Nigeria' || !settings.address) ? '15 Akinremi St. Ikeja, Lagos 101233' : settings.address,
    phone: isPlaceholderPhone ? '+234 816 237 8769' : settings.phone,
    email: isOldEmail ? 'akeidsam69@gmail.com' : settings.email,
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

    // Create new default settings for Samidak
    const defaultSettings: CompanySettings = {
      name: 'SAMIDAK TECHNICAL AND ALLIED SERVICES',
      regNumber: 'RC 6891936',
      address: '13, Adeyemi Makinde Str Alagbado-Ila, Alegeunle B/Stop, Lagos State, Nigeria.', // Using address from previous invoice image or user info if not specified? 
      // User said "appear with the companies address... phone... email". 
      // The image showed "13, Adeyemi Makinde Str, Alagbado-Ila...". I should use what's in the image or placeholder if not provided fully.
      // Wait, user provided email and phone. The image shows:
      // "13, Adeyemi Makinde Str, Alagbado-Ila, Aigunle B/Stop, Lagos State, Nigeria"
      // I will update the address to match the image + new details.
      phone: '+234 816 237 8769',
      email: 'akeidsam69@gmail.com',
      bankAccounts: [
        {
          bankName: 'FCMB',
          accountName: 'SAMIDAK TECHNICAL AND ALLIED SERVICES',
          accountNumber: '2002376450',
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
      name: 'SAMIDAK TECHNICAL AND ALLIED SERVICES',
      address: 'Lagos, Nigeria',
      phone: '+234 816 237 8769',
      email: 'akeidsam69@gmail.com',
      bankAccounts: [
        {
          bankName: 'FCMB',
          accountName: 'SAMIDAK TECHNICAL AND ALLIED SERVICES',
          accountNumber: '2002376450',
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
