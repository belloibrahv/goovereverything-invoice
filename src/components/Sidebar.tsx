'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FileText, FilePlus, Users, Settings, Home, X, Truck, Receipt, Mail, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'New Document', href: '/create', icon: FilePlus },
  { name: 'Invoices', href: '/documents?type=invoice', icon: Receipt },
  { name: 'Quotations', href: '/documents?type=quotation', icon: FileText },
  { name: 'Waybills', href: '/documents?type=waybill', icon: Truck },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Email Templates', href: '/emails', icon: Mail },
  { name: 'Company Profile', href: '/profile', icon: BookOpen },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-dvh w-[min(18rem,85vw)] bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:w-64 shadow-lg lg:shadow-none flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between gap-2 h-16 px-3 border-b border-gray-200 bg-white shrink-0 safe-top">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center min-w-0 flex-1"
          >
            <Image
              src="/samidak_logo.png"
              alt="SAMIDAK"
              width={200}
              height={72}
              className="object-contain object-left h-10 w-auto max-w-[11rem]"
              priority
            />
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors touch-target"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto flex-1 overscroll-contain pb-6">
          {navigation.map((item) => {
            const base = item.href.split('?')[0];
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === base || pathname.startsWith(base + '/');

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 touch-target',
                  isActive
                    ? 'bg-gradient-to-r from-red-50 to-red-100 text-brand-red border-l-4 border-brand-red shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
