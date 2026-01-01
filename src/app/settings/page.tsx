'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppShell } from '@/components/AppShell';
import { db, initializeSettings } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import type { CompanySettings, Currency, BankAccount } from '@/types';

const emptyBankAccount = (): BankAccount => ({
  bankName: '',
  accountName: '',
  accountNumber: '',
  currency: 'NGN',
});

export default function SettingsPage() {
  const { settings, setSettings } = useAppStore();
  const [form, setForm] = useState<CompanySettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      // Migrate old settings format if needed
      const needsMigration = !settings.bankAccounts || settings.bankAccounts.length === 0;
      const migratedSettings: CompanySettings = {
        ...settings,
        bankAccounts: settings.bankAccounts && settings.bankAccounts.length > 0
          ? settings.bankAccounts
          : [
            {
              bankName: (settings as any).bankName || 'Your Bank',
              accountName: settings.name || 'Account Name',
              accountNumber: (settings as any).accountNumber || '',
              currency: 'NGN' as Currency,
            },
          ],
      };
      setForm(migratedSettings);

      // Update store with migrated settings
      if (needsMigration) {
        setSettings(migratedSettings);
      }
    } else {
      initializeSettings().then((s) => {
        setSettings(s);
        setForm(s);
      });
    }
  }, [settings, setSettings]);

  const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
    if (!form) return;
    const updated = [...form.bankAccounts];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, bankAccounts: updated });
  };

  const addBankAccount = () => {
    if (!form) return;
    setForm({ ...form, bankAccounts: [...form.bankAccounts, emptyBankAccount()] });
  };

  const removeBankAccount = (index: number) => {
    if (!form || form.bankAccounts.length <= 1) return;
    const updated = form.bankAccounts.filter((_, i) => i !== index);
    setForm({ ...form, bankAccounts: updated });
  };

  const handleSave = async () => {
    if (!form?.id) return;

    // Validate bank accounts
    const hasValidAccount = form.bankAccounts.some(
      (acc) => acc.bankName && acc.accountNumber
    );
    if (!hasValidAccount) {
      toast.error('Please add at least one bank account with bank name and account number');
      return;
    }

    setSaving(true);
    try {
      await db.settings.put(form);
      setSettings(form);
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <AppShell>
        <div className="p-8 text-center">Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure your company details and payment information</p>
        </div>

        <div className="card p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b pb-2">Company Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Company Name</label>
              <input
                type="text"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Address</label>
              <input
                type="text"
                className="input"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+234 816 237 8769"
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="akeidsam69@gmail.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Technical Director Name</label>
              <input
                type="text"
                className="input"
                value={form.technicalDirectorName || ''}
                onChange={(e) => setForm({ ...form, technicalDirectorName: e.target.value })}
                placeholder="Enter Technical Director's full name (optional)"
              />
              <p className="text-xs text-gray-500 mt-1">This name will appear on invoices above the signature</p>
            </div>
          </div>

          {/* Bank Accounts Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h2 className="text-lg font-semibold">Bank Accounts</h2>
              <button onClick={addBankAccount} className="btn-secondary text-sm">
                <Plus className="w-4 h-4" /> Add Account
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              These account details will appear on your invoices for customers to make payments.
            </p>

            <div className="space-y-4">
              {form.bankAccounts.map((account, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Account {index + 1}</span>
                    {form.bankAccounts.length > 1 && (
                      <button
                        onClick={() => removeBankAccount(index)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Bank Name *</label>
                      <input
                        type="text"
                        className="input"
                        value={account.bankName}
                        onChange={(e) => updateBankAccount(index, 'bankName', e.target.value)}
                        placeholder="e.g. First Bank, GTBank"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Account Name *</label>
                      <input
                        type="text"
                        className="input"
                        value={account.accountName}
                        onChange={(e) => updateBankAccount(index, 'accountName', e.target.value)}
                        placeholder="Account holder name"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Account Number *</label>
                      <input
                        type="text"
                        className="input font-mono"
                        value={account.accountNumber}
                        onChange={(e) => updateBankAccount(index, 'accountNumber', e.target.value)}
                        placeholder="0123456789"
                      />
                    </div>
                    <div>
                      <label className="label text-xs">Currency</label>
                      <select
                        className="input"
                        value={account.currency || 'NGN'}
                        onChange={(e) => updateBankAccount(index, 'currency', e.target.value)}
                      >
                        <option value="NGN">NGN (Naira)</option>
                        <option value="USD">USD (Dollar)</option>
                        <option value="EUR">EUR (Euro)</option>
                        <option value="GBP">GBP (Pound)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h2 className="text-lg font-semibold border-b pb-2 pt-4">Defaults</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Default Currency</label>
              <select
                className="input"
                value={form.defaultCurrency}
                onChange={(e) => setForm({ ...form, defaultCurrency: e.target.value as Currency })}
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>

            <div>
              <label className="label">Default Tax Rate (%)</label>
              <input
                type="number"
                className="input"
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
                step="0.5"
              />
              <p className="text-xs text-gray-500 mt-1">Nigerian VAT is typically 7.5%</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-2">Offline Storage</h2>
          <p className="text-sm text-gray-600">
            All your data is stored locally on this device using IndexedDB. Your invoices, quotations,
            and waybills are available even when you're offline.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
