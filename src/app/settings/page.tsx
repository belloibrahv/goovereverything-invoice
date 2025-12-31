'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppShell } from '@/components/AppShell';
import { db, initializeSettings } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import type { CompanySettings, Currency } from '@/types';

export default function SettingsPage() {
  const { settings, setSettings } = useAppStore();
  const [form, setForm] = useState<CompanySettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm(settings);
    } else {
      initializeSettings().then((s) => {
        setSettings(s);
        setForm(s);
      });
    }
  }, [settings, setSettings]);

  const handleSave = async () => {
    if (!form?.id) return;
    setSaving(true);
    try {
      await db.settings.update(form.id, form);
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
          <p className="text-gray-600">Configure your company details and preferences</p>
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
                placeholder="+234..."
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <h2 className="text-lg font-semibold border-b pb-2 pt-4">Bank Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Bank Name</label>
              <input
                type="text"
                className="input"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Account Number</label>
              <input
                type="text"
                className="input"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              />
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

        {/* Data Info */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-2">Offline Storage</h2>
          <p className="text-sm text-gray-600">
            All your data is stored locally on this device using IndexedDB. Your invoices, quotations,
            and waybills are available even when you're offline. Data syncs automatically when you
            install this app as a PWA.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
