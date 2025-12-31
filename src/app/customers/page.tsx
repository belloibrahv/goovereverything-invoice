'use client';

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppShell } from '@/components/AppShell';
import { db } from '@/lib/db';

export default function CustomersPage() {
  const [search, setSearch] = useState('');

  const customers = useLiveQuery(() => db.customers.orderBy('name').toArray());

  const filtered = customers?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  const handleDelete = async (id: number) => {
    if (confirm('Delete this customer?')) {
      await db.customers.delete(id);
      toast.success('Customer deleted');
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered?.map((customer) => (
            <div key={customer.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                <button
                  onClick={() => handleDelete(customer.id!)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5 text-sm text-gray-600">
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered?.length === 0 && (
          <div className="card p-8 text-center text-gray-500">
            No customers found. Customers are automatically saved when you create documents.
          </div>
        )}
      </div>
    </AppShell>
  );
}
