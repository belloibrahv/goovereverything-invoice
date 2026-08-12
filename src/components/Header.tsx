'use client';

import { useState, useEffect } from 'react';
import { Menu, Wifi, WifiOff, Download } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function Header() {
  const { setSidebarOpen } = useAppStore();
  const isOnline = useOnlineStatus();
  const [mounted, setMounted] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setMounted(true);
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm no-print safe-top">
      <div className="flex items-center justify-between min-h-14 sm:min-h-16 px-3 sm:px-4 gap-2">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2.5 rounded-lg hover:bg-gray-100 transition-colors touch-target"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex-1 min-w-0">
          <p className="lg:hidden text-sm font-semibold text-gray-900 truncate">SAMIDAK</p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {mounted && installEvent && (
            <button
              type="button"
              onClick={handleInstall}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-red-50 text-brand-red border border-red-100 touch-target"
              aria-label="Install app"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}
          {mounted && (
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isOnline
                  ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 shadow-sm'
                  : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 shadow-sm'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
