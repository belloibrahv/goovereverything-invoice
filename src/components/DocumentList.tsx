'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { Eye, Edit, Trash2, Download, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Document, DocumentType } from '@/types';
import { db } from '@/lib/db';
import { formatCurrency, formatShortDate, cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { generatePDF, downloadPDF } from '@/lib/pdf';

interface Props {
  type?: DocumentType;
}

export function DocumentList({ type }: Props) {
  const { settings } = useAppStore();
  const [search, setSearch] = useState('');

  const documents = useLiveQuery(async () => {
    let query = db.documents.orderBy('createdAt').reverse();
    if (type) {
      query = db.documents.where('type').equals(type).reverse();
    }
    return query.toArray();
  }, [type]);

  const filtered = documents?.filter(
    (doc) =>
      doc.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      doc.customer.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await db.documents.delete(id);
      toast.success('Document deleted');
    }
  };

  const handleDownload = async (doc: Document) => {
    if (!settings) return;
    const pdf = await generatePDF(doc, settings);
    downloadPDF(pdf, `${doc.type}-${doc.serialNumber}`);
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const typeLabels = {
    invoice: 'Invoice',
    quotation: 'Quotation',
    waybill: 'Waybill',
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Search by serial number or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Serial #
                </th>
                {!type && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered?.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {doc.serialNumber}
                  </td>
                  {!type && (
                    <td className="px-4 py-3 text-sm text-gray-600">{typeLabels[doc.type]}</td>
                  )}
                  <td className="px-4 py-3 text-sm text-gray-600">{doc.customer.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatShortDate(doc.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium">
                    {formatCurrency(doc.total, doc.currency)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                        statusColors[doc.status]
                      )}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/create?edit=${doc.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id!)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y">
          {filtered?.map((doc) => (
            <div key={doc.id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900">{doc.serialNumber}</p>
                  <p className="text-sm text-gray-600">{doc.customer.name}</p>
                </div>
                <span
                  className={cn(
                    'inline-flex px-2 py-1 text-xs font-medium rounded-full',
                    statusColors[doc.status]
                  )}
                >
                  {doc.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{formatShortDate(doc.createdAt)}</span>
                <span className="font-semibold">{formatCurrency(doc.total, doc.currency)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Link href={`/documents/${doc.id}`} className="btn-outline flex-1 text-sm py-2.5 justify-center">
                  <Eye className="w-4 h-4" /> View
                </Link>
                <Link href={`/create?edit=${doc.id}`} className="btn-outline flex-1 text-sm py-2.5 justify-center">
                  <Edit className="w-4 h-4" /> Edit
                </Link>
                <button
                  onClick={() => handleDownload(doc)}
                  className="btn-outline flex-1 text-sm py-2.5 justify-center"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered?.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No documents found. <Link href="/create" className="text-red-600 hover:underline">Create one</Link>
          </div>
        )}
      </div>
    </div>
  );
}
