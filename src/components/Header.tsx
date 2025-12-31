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
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 no-print">
      <div className="flex items-center justify-between h-16 px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 lg:ml-0" />

        <div className="flex items-center gap-3">
          {mounted && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                isOnline ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
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
