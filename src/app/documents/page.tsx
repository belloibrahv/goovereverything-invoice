'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { FilePlus } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { DocumentList } from '@/components/DocumentList';
import type { DocumentType } from '@/types';

function DocumentsContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as DocumentType | null;

  const titles: Record<string, string> = {
    invoice: 'Invoices',
    quotation: 'Quotations',
    waybill: 'Waybills',
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {type ? titles[type] : 'All Documents'}
            </h1>
            <p className="text-gray-600">
              {type ? `Manage your ${type}s` : 'View and manage all your documents'}
            </p>
          </div>
          <Link href={`/create${type ? `?type=${type}` : ''}`} className="btn-primary">
            <FilePlus className="w-4 h-4" /> New {type || 'Document'}
          </Link>
        </div>
        <DocumentList type={type || undefined} />
      </div>
    </AppShell>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <DocumentsContent />
    </Suspense>
  );
}
