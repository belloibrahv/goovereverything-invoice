'use client';

import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { db, initializeSettings } from '@/lib/db';
import { useAppStore } from '@/lib/store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { setSettings } = useAppStore();

  useEffect(() => {
    initializeSettings().then(setSettings);
  }, [setSettings]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
