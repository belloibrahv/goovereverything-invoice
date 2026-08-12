'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { initializeSettings } from '@/lib/db';
import { useAppStore } from '@/lib/store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { setSettings } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initializeSettings().then(setSettings).catch(console.error);
  }, [setSettings]);

  if (!mounted) {
    return (
      <div className="flex min-h-dvh bg-gradient-to-br from-stone-50 via-white to-neutral-50 items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-red to-brand-red-dark animate-pulse" />
          <p className="text-gray-500 font-medium text-sm sm:text-base">Loading SAMIDAK...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh bg-gradient-to-br from-stone-50 via-white to-neutral-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-dvh">
        <Header />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </main>
      </div>
      <PWAInstallPrompt />
    </div>
  );
}
