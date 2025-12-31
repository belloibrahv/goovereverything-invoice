'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Save, Printer, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Document, DocumentType, LineItem, Customer, Currency } from '@/types';
import { db, generateSerialNumber } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { generatePDF, downloadPDF, printPDF } from '@/lib/pdf';

interface Props {
  type?: DocumentType;
  editId?: number;
}

const emptyItem = (): LineItem => ({
  id: uuidv4(),
  description: '',
  quantity: 1,
  unitPrice: 0,
  amount: 0,
});

export function DocumentForm({ type = 'invoice', editId }: Props) {
  const router = useRouter();
  const { settings } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState<DocumentType>(type);
  const [currency, setCurrency] = useState<Currency>(settings?.defaultCurrency || 'NGN');
  const [customer, setCustomer] = useState<Customer>({
    name: '',
    email: '',
    phone: '',
    address: '',
    createdAt: new Date(),
  });
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(settings?.taxRate || 7.5);
  const [existingDoc, setExistingDoc] = useState<Document | null>(null);

  useEffect(() => {
    if (editId) {
      db.documents.get(editId).then((doc) => {
        if (doc) {
          setExistingDoc(doc);
          setDocType(doc.type);
          setCurrency(doc.currency);
          setCustomer(doc.customer);
          setItems(doc.items);
          setNotes(doc.notes || '');
          setTaxRate(doc.taxRate);
        }
      });
    }
  }, [editId]);

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.amount = updated.quantity * updated.unitPrice;
        return updated;
      })
    );
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const handleSave = async (andPrint = false) => {
    if (!customer.name.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (items.every((i) => !i.description.trim())) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const serialNumber = existingDoc?.serialNumber || (await generateSerialNumber(docType));
      const doc: Document = {
        id: existingDoc?.id,
        serialNumber,
        type: docType,
        customer,
        items: items.filter((i) => i.description.trim()),
        subtotal,
        tax,
        taxRate,
        total,
        currency,
        notes,
        createdAt: existingDoc?.createdAt || new Date(),
        updatedAt: new Date(),
        status: 'draft',
      };

      if (existingDoc?.id) {
        await db.documents.put(doc);
      } else {
        await db.documents.add(doc);
      }

      // Save customer if new
      const existingCustomer = await db.customers.where('name').equals(customer.name).first();
      if (!existingCustomer) {
        await db.customers.add(customer);
      }

      toast.success(`${docType.charAt(0).toUpperCase() + docType.slice(1)} saved!`);

      if (andPrint && settings) {
        const pdf = await generatePDF(doc, settings);
        printPDF(pdf);
      }

      router.push('/documents?type=' + docType);
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!settings) return;
    const serialNumber = existingDoc?.serialNumber || 'DRAFT';
    const doc: Document = {
      serialNumber,
      type: docType,
      customer,
      items: items.filter((i) => i.description.trim()),
      subtotal,
      tax,
      taxRate,
      total,
      currency,
      notes,
      createdAt: existingDoc?.createdAt || new Date(),
      updatedAt: new Date(),
      status: 'draft',
    };
    const pdf = await generatePDF(doc, settings);
    downloadPDF(pdf, `${docType}-${serialNumber}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 space-y-6">
        {/* Document Type Selector */}
        <div className="flex flex-wrap gap-2">
          {(['invoice', 'quotation', 'waybill'] as DocumentType[]).map((t) => (
            <button
              key={t}
              onClick={() => setDocType(t)}
              disabled={!!editId}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                docType === t
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${editId ? 'cursor-not-allowed' : ''}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Customer Name *</label>
            <input
              type="text"
              className="input"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              className="input"
              value={customer.phone || ''}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="+234..."
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={customer.email || ''}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              placeholder="customer@email.com"
            />
          </div>
          <div>
            <label className="label">Address</label>
            <input
              type="text"
              className="input"
              value={customer.address || ''}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="Customer address"
            />
          </div>
        </div>

        {/* Currency & Tax */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Currency</label>
            <select
              className="input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              <option value="NGN">NGN (₦)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="label">Tax Rate (%)</label>
            <input
              type="number"
              className="input"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.5"
            />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <label className="label">Items</label>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="flex flex-wrap gap-2 items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    className="input"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    className="input text-center"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                    placeholder="Qty"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    className="input"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    placeholder="Unit price"
                  />
                </div>
                <div className="w-32 py-2.5 text-right font-medium text-gray-700">
                  {formatCurrency(item.amount, currency)}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className="mt-3 btn-secondary">
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax ({taxRate}%)</span>
              <span className="font-medium">{formatCurrency(tax, currency)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total</span>
              <span className="text-red-600">{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <textarea
            className="input min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes or terms..."
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <button onClick={() => handleSave(false)} disabled={loading} className="btn-primary">
            <Save className="w-4 h-4" /> Save
          </button>
          <button onClick={() => handleSave(true)} disabled={loading} className="btn-secondary">
            <Printer className="w-4 h-4" /> Save & Print
          </button>
          <button onClick={handleDownload} className="btn-outline">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
