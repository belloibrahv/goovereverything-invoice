import Dexie, { type EntityTable } from 'dexie';
import type {
  Document,
  Customer,
  CompanySettings,
  SerialCounter,
  BankAccount,
  CompanyProfileContent,
} from '@/types';

const db = new Dexie('GoovereverythingDB') as Dexie & {
  documents: EntityTable<Document, 'id'>;
  customers: EntityTable<Customer, 'id'>;
  settings: EntityTable<CompanySettings, 'id'>;
  serialCounters: EntityTable<SerialCounter, 'id'>;
  companyProfile: EntityTable<CompanyProfileContent, 'id'>;
};

db.version(1).stores({
  documents: '++id, serialNumber, type, status, createdAt',
  customers: '++id, name, email, phone',
  settings: '++id',
  serialCounters: '++id, type, year',
});

db.version(2).stores({
  documents: '++id, serialNumber, type, status, createdAt',
  customers: '++id, name, email, phone',
  settings: '++id',
  serialCounters: '++id, type, year',
  companyProfile: '++id',
});

export { db };

// Migrate documents to include discount fields
async function migrateDocuments() {
  try {
    const documents = await db.documents.toArray();
    const documentsToUpdate = documents.filter(doc => 
      doc.discount === undefined || doc.discountRate === undefined
    );

    if (documentsToUpdate.length > 0) {
      for (const doc of documentsToUpdate) {
        // Add default discount fields for existing documents
        const updatedDoc = {
          ...doc,
          discount: doc.discount || 0,
          discountRate: doc.discountRate || 5,
        };
        await db.documents.put(updatedDoc);
      }
      console.log(`Migrated ${documentsToUpdate.length} documents with discount fields`);
    }
  } catch (error) {
    console.error('Failed to migrate documents:', error);
  }
}

// Initialize migration when database is opened
db.on('ready', () => {
  return migrateDocuments();
});

const DEFAULT_EMAIL = 'info@samidakservices.com';
const DEFAULT_WEBSITE = 'www.samidakservices.com';
const OLD_EMAILS = new Set([
  'info@goovereverything.com',
  'info@samidak.com',
  'akeidsam69@gmail.com',
  'samidaktechnicalallied@gmail.com',
]);

// Migrate old settings format to new format with bankAccounts array
function migrateSettings(settings: any): CompanySettings {
  // Migrate from old format (bankName, accountNumber) to new format (bankAccounts array)
  let bankAccounts: BankAccount[] =
    settings.bankAccounts && Array.isArray(settings.bankAccounts) && settings.bankAccounts.length > 0
      ? settings.bankAccounts
      : [];

  if (bankAccounts.length === 0) {
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
  }

  // Check for placeholders or old defaults that need updating
  const isPlaceholderPhone = settings.phone === '+234 XXX XXX XXXX' || !settings.phone;
  const isOldEmail = !settings.email || OLD_EMAILS.has(String(settings.email).toLowerCase());
  const isOldName = settings.name === 'GOOVEREVERYTHING' || settings.name === 'SAMIDAK' || !settings.name;

  return {
    ...settings,
    id: settings.id,
    name: isOldName ? 'SAMIDAK TECHNICAL AND ALLIED SERVICES' : settings.name,
    regNumber: settings.regNumber || 'RC 6891936',
    address: (settings.address === 'Lagos, Nigeria' || !settings.address)
      ? '13, Adeyemi Makinde Str Alagbado-Ila, Alegeunle B/Stop, Lagos State, Nigeria.'
      : settings.address,
    phone: isPlaceholderPhone ? '+234 816 237 8769' : settings.phone,
    email: isOldEmail ? DEFAULT_EMAIL : settings.email,
    website: settings.website || DEFAULT_WEBSITE,
    bankAccounts,
    taxRate: settings.taxRate ?? 7.5,
    discountRate: settings.discountRate ?? 5, // Default 5% discount
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
      const prev = existing[0] as CompanySettings;

      // Persist when bank accounts, email, or website were updated
      const needsSave =
        !prev.bankAccounts ||
        prev.bankAccounts.length === 0 ||
        prev.email !== migrated.email ||
        prev.website !== migrated.website;

      if (needsSave) {
        await db.settings.put(migrated);
      }

      return migrated;
    }

    // Create new default settings for Samidak
    const defaultSettings: CompanySettings = {
      name: 'SAMIDAK TECHNICAL AND ALLIED SERVICES',
      regNumber: 'RC 6891936',
      address: '13, Adeyemi Makinde Str Alagbado-Ila, Alegeunle B/Stop, Lagos State, Nigeria.',
      phone: '+234 816 237 8769',
      email: DEFAULT_EMAIL,
      website: DEFAULT_WEBSITE,
      bankAccounts: [
        {
          bankName: 'FCMB',
          accountName: 'SAMIDAK TECHNICAL AND ALLIED SERVICES',
          accountNumber: '2002376450',
          currency: 'NGN',
        },
      ],
      taxRate: 7.5,
      discountRate: 5, // Default 5% discount
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
      email: DEFAULT_EMAIL,
      website: DEFAULT_WEBSITE,
      bankAccounts: [
        {
          bankName: 'FCMB',
          accountName: 'SAMIDAK TECHNICAL AND ALLIED SERVICES',
          accountNumber: '2002376450',
          currency: 'NGN',
        },
      ],
      taxRate: 7.5,
      discountRate: 5, // Default 5% discount
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

export const DEFAULT_PROFILE_CONTENT: Omit<CompanyProfileContent, 'id'> = {
  tagline: 'Industrial Engineering Solutions You Can Trust',
  whoWeAre:
    'SAMIDAK Technical and Allied Services Nigeria Limited is an industrial engineering company committed to delivering reliable, efficient, and professional engineering solutions. We help businesses keep equipment running, reduce downtime, and improve operational performance through quality products and technical support.',
  vision:
    "To become Africa's most trusted industrial engineering solutions provider, recognized for innovation, reliability, technical excellence, and outstanding customer satisfaction.",
  mission:
    'To deliver reliable, efficient, and innovative industrial engineering solutions that help businesses optimize performance, reduce downtime, and achieve sustainable growth.',
  productImages: [],
  projectImages: [],
  certImages: [],
  updatedAt: new Date(),
};

export async function getCompanyProfile(): Promise<CompanyProfileContent> {
  const existing = await db.companyProfile.toArray();
  if (existing.length > 0) {
    return existing[0];
  }
  const profile = { ...DEFAULT_PROFILE_CONTENT, updatedAt: new Date() };
  const id = await db.companyProfile.add(profile);
  return { ...profile, id };
}

export async function saveCompanyProfile(
  profile: CompanyProfileContent
): Promise<CompanyProfileContent> {
  const toSave = { ...profile, updatedAt: new Date() };
  if (toSave.id) {
    await db.companyProfile.put(toSave);
    return toSave;
  }
  const id = await db.companyProfile.add(toSave);
  return { ...toSave, id };
}
