'use client';

import { useState, useEffect } from 'react';
import { Menu, Wifi, WifiOff } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function Header() {
  const { setSidebarOpen } = useAppStore();
  const isOnline = useOnlineStatus();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm no-print">
      <div className="flex items-center justify-between h-16 px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1 lg:ml-0" />

        <div className="flex items-center gap-3">
          {mounted && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isOnline 
                  ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm' 
                  : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 shadow-sm'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  Offline
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
