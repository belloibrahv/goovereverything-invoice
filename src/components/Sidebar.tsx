'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FileText, FilePlus, Users, Settings, Home, X, Truck, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'New Document', href: '/create', icon: FilePlus },
  { name: 'Invoices', href: '/documents?type=invoice', icon: Receipt },
  { name: 'Quotations', href: '/documents?type=quotation', icon: FileText },
  { name: 'Waybills', href: '/documents?type=waybill', icon: Truck },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-lg lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <Link href="/" className="flex items-center gap-0 group overflow-hidden">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="SAMIDAK Logo"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <div className="relative flex-shrink-0" style={{ width: '200px', height: '80px', marginLeft: '-16px' }}>
              <Image
                src="/samidak-logo.png"
                alt="SAMIDAK"
                fill
                className="object-contain object-left"
              />
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-l-4 border-red-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
