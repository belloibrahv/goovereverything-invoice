'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Download, Printer, CheckCircle, XCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppShell } from '@/components/AppShell';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generatePDF, downloadPDF, printPDF } from '@/lib/pdf';
import type { Document } from '@/types';

export default function DocumentViewPage() {
  const params = useParams();
  const router = useRouter();
  const { settings } = useAppStore();
  const [doc, setDoc] = useState<Document | null>(null);

  useEffect(() => {
    const id = parseInt(params.id as string);
    db.documents.get(id).then((d) => {
      if (d) setDoc(d);
      else router.push('/documents');
    });
  }, [params.id, router]);

  const updateStatus = async (status: Document['status']) => {
    if (!doc?.id) return;
    await db.documents.update(doc.id, { status });
    setDoc({ ...doc, status });
    toast.success(`Status updated to ${status}`);
  };

  const handleDownload = async () => {
    if (!doc || !settings) return;
    const pdf = await generatePDF(doc, settings);
    downloadPDF(pdf, `${doc.type}-${doc.serialNumber}`);
  };

  const handlePrint = async () => {
    if (!doc || !settings) return;
    const pdf = await generatePDF(doc, settings);
    printPDF(pdf);
  };

  if (!doc) {
    return (
      <AppShell>
        <div className="p-8 text-center">Loading...</div>
      </AppShell>
    );
  }

  const typeLabels = { invoice: 'Invoice', quotation: 'Quotation', waybill: 'Waybill' };
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/documents" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {typeLabels[doc.type]} #{doc.serialNumber}
              </h1>
              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[doc.status]}`}>
                {doc.status}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/create?edit=${doc.id}`} className="btn-outline">
              <Edit className="w-4 h-4" /> Edit
            </Link>
            <button onClick={handleDownload} className="btn-outline">
              <Download className="w-4 h-4" /> Download
            </button>
            <button onClick={handlePrint} className="btn-primary">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        {/* Document Preview */}
        <div className="card p-6 md:p-8 space-y-6">
          {/* Company Header */}
          <div className="flex flex-col md:flex-row md:justify-between gap-4 pb-6 border-b">
            <div>
              <h2 className="text-2xl font-bold text-red-600">{settings?.name || 'GOOVEREVERYTHING'}</h2>
              <p className="text-sm text-gray-600">{settings?.address}</p>
              <p className="text-sm text-gray-600">Phone: {settings?.phone}</p>
              <p className="text-sm text-gray-600">Email: {settings?.email}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-lg font-semibold text-gray-800">{typeLabels[doc.type].toUpperCase()}</p>
              <p className="text-gray-600">#{doc.serialNumber}</p>
              <p className="text-sm text-gray-500">Date: {formatDate(doc.createdAt)}</p>
              {doc.dueDate && <p className="text-sm text-gray-500">Due: {formatDate(doc.dueDate)}</p>}
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Bill To:</p>
            <p className="font-semibold">{doc.customer.name}</p>
            {doc.customer.address && <p className="text-sm text-gray-600">{doc.customer.address}</p>}
            {doc.customer.phone && <p className="text-sm text-gray-600">Phone: {doc.customer.phone}</p>}
            {doc.customer.email && <p className="text-sm text-gray-600">Email: {doc.customer.email}</p>}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Qty</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Unit Price</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {doc.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice, doc.currency)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.amount, doc.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(doc.subtotal, doc.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({doc.taxRate}%)</span>
                <span>{formatCurrency(doc.tax, doc.currency)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-red-600">{formatCurrency(doc.total, doc.currency)}</span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {doc.type === 'invoice' && settings && (
            <div className="pt-4 border-t">
              <p className="font-medium text-gray-800 mb-1">Payment Details:</p>
              <p className="text-sm text-gray-600">Bank: {settings.bankName}</p>
              <p className="text-sm text-gray-600">Account Number: {settings.accountNumber}</p>
            </div>
          )}

          {/* Notes */}
          {doc.notes && (
            <div className="pt-4 border-t">
              <p className="font-medium text-gray-800 mb-1">Notes:</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{doc.notes}</p>
            </div>
          )}
        </div>

        {/* Status Actions */}
        <div className="card p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Update Status:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateStatus('sent')}
              disabled={doc.status === 'sent'}
              className="btn-outline text-sm"
            >
              <Send className="w-4 h-4" /> Mark as Sent
            </button>
            <button
              onClick={() => updateStatus('paid')}
              disabled={doc.status === 'paid'}
              className="btn-outline text-sm text-green-600 border-green-300 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4" /> Mark as Paid
            </button>
            <button
              onClick={() => updateStatus('cancelled')}
              disabled={doc.status === 'cancelled'}
              className="btn-outline text-sm text-red-600 border-red-300 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
