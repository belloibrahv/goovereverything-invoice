'use client';

import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { FileText, FilePlus, Receipt, Truck, TrendingUp } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const stats = useLiveQuery(async () => {
    const invoices = await db.documents.where('type').equals('invoice').toArray();
    const quotations = await db.documents.where('type').equals('quotation').toArray();
    const waybills = await db.documents.where('type').equals('waybill').toArray();

    const totalRevenue = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);

    const pendingAmount = invoices
      .filter((i) => i.status === 'draft' || i.status === 'sent')
      .reduce((sum, i) => sum + i.total, 0);

    return {
      invoiceCount: invoices.length,
      quotationCount: quotations.length,
      waybillCount: waybills.length,
      totalRevenue,
      pendingAmount,
    };
  });

  const recentDocs = useLiveQuery(() =>
    db.documents.orderBy('createdAt').reverse().limit(5).toArray()
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome to GOOVEREVERYTHING Invoice System</p>
          </div>
          <Link href="/create" className="btn-primary">
            <FilePlus className="w-4 h-4" /> New Document
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Receipt className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.invoiceCount || 0}</p>
                <p className="text-sm text-gray-600">Invoices</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.quotationCount || 0}</p>
                <p className="text-sm text-gray-600">Quotations</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Truck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.waybillCount || 0}</p>
                <p className="text-sm text-gray-600">Waybills</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/create?type=invoice"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <Receipt className="w-6 h-6 text-red-600" />
              <div>
                <p className="font-medium">New Invoice</p>
                <p className="text-sm text-gray-500">Create a new invoice</p>
              </div>
            </Link>
            <Link
              href="/create?type=quotation"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium">New Quotation</p>
                <p className="text-sm text-gray-500">Create a price quote</p>
              </div>
            </Link>
            <Link
              href="/create?type=waybill"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
            >
              <Truck className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium">New Waybill</p>
                <p className="text-sm text-gray-500">Create delivery note</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Documents</h2>
            <Link href="/documents" className="text-sm text-red-600 hover:underline">
              View all
            </Link>
          </div>
          {recentDocs && recentDocs.length > 0 ? (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        doc.type === 'invoice'
                          ? 'bg-red-100'
                          : doc.type === 'quotation'
                          ? 'bg-blue-100'
                          : 'bg-amber-100'
                      }`}
                    >
                      {doc.type === 'invoice' ? (
                        <Receipt className="w-4 h-4 text-red-600" />
                      ) : doc.type === 'quotation' ? (
                        <FileText className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Truck className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.serialNumber}</p>
                      <p className="text-xs text-gray-500">{doc.customer.name}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-sm">{formatCurrency(doc.total, doc.currency)}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No documents yet.{' '}
              <Link href="/create" className="text-red-600 hover:underline">
                Create your first one
              </Link>
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
