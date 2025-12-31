'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AppShell } from '@/components/AppShell';
import { DocumentForm } from '@/components/DocumentForm';
import type { DocumentType } from '@/types';

function CreateContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') as DocumentType) || 'invoice';
  const editId = searchParams.get('edit');

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {editId ? 'Edit Document' : 'Create New Document'}
          </h1>
          <p className="text-gray-600">
            {editId ? 'Update the document details below' : 'Fill in the details to create a new document'}
          </p>
        </div>
        <DocumentForm type={type} editId={editId ? parseInt(editId) : undefined} />
      </div>
    </AppShell>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <CreateContent />
    </Suspense>
  );
}
