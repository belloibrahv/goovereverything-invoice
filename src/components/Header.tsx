'use client';

import { useState } from 'react';
import { Menu, Wifi, WifiOff, Download, Share, PlusSquare, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function Header() {
  const { setSidebarOpen } = useAppStore();
  const isOnline = useOnlineStatus();
  const { mounted, canInstall, canPrompt, ios, promptInstall, standalone } = usePWAInstall();
  const [helpOpen, setHelpOpen] = useState(false);

  const handleInstall = async () => {
    if (canPrompt) {
      await promptInstall();
      return;
    }
    setHelpOpen(true);
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
          {mounted && canInstall && (
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

      {helpOpen && !standalone && (
        <div className="border-t border-gray-100 bg-white px-3 sm:px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs text-gray-700 space-y-2">
              <p className="font-semibold text-gray-900 text-sm">Add SAMIDAK to your home screen</p>
              {ios ? (
                <ol className="space-y-1.5 list-none">
                  <li className="flex gap-2">
                    <Share className="w-4 h-4 text-brand-red shrink-0" />
                    Tap Share in Safari
                  </li>
                  <li className="flex gap-2">
                    <PlusSquare className="w-4 h-4 text-brand-red shrink-0" />
                    Choose “Add to Home Screen”
                  </li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open this site in Chrome on your phone</li>
                  <li>Menu (⋮) → Install app / Add to Home screen</li>
                </ol>
              )}
            </div>
            <button
              type="button"
              className="p-1.5 text-gray-400 hover:text-gray-700"
              onClick={() => setHelpOpen(false)}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
