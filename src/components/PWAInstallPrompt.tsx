'use client';

import { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAInstallPrompt() {
  const { canInstall, canPrompt, ios, promptInstall, standalone, mounted } = usePWAInstall();
  const [visible, setVisible] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    if (!mounted || standalone || !canInstall) return;
    const dismissed = localStorage.getItem('samidak-pwa-dismissed') === '1';
    if (dismissed) return;

    const t = window.setTimeout(() => setVisible(true), ios ? 1800 : 1200);
    return () => window.clearTimeout(t);
  }, [mounted, standalone, canInstall, ios]);

  if (!mounted || standalone || !visible) return null;

  const dismiss = () => {
    setVisible(false);
    setShowIOSHelp(false);
    localStorage.setItem('samidak-pwa-dismissed', '1');
  };

  const install = async () => {
    if (canPrompt) {
      const ok = await promptInstall();
      if (ok) dismiss();
      return;
    }
    if (ios) {
      setShowIOSHelp(true);
      return;
    }
    // Desktop Chrome / browsers without deferred prompt yet
    setShowIOSHelp(true);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[70] p-3 sm:p-4 pointer-events-none safe-bottom">
      <div className="pointer-events-auto mx-auto max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl p-4">
        <div className="flex gap-3 items-start">
          <div className="p-2 rounded-lg bg-red-50 text-brand-red shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">Install SAMIDAK on your phone</p>
            <p className="text-xs text-gray-600 mt-1">
              Add it to your home screen — opens like an app, works offline with your saved documents.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 touch-target"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {showIOSHelp && (
          <ol className="mt-3 space-y-2 text-xs text-gray-700 bg-stone-50 border border-stone-100 rounded-lg p-3">
            {ios ? (
              <>
                <li className="flex gap-2 items-start">
                  <Share className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                  <span>
                    Tap the <strong>Share</strong> button in Safari (square with an arrow).
                  </span>
                </li>
                <li className="flex gap-2 items-start">
                  <PlusSquare className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                  <span>
                    Scroll and tap <strong>Add to Home Screen</strong>, then Add.
                  </span>
                </li>
              </>
            ) : (
              <>
                <li>
                  Open this site in <strong>Chrome</strong> on your phone.
                </li>
                <li>
                  Tap the menu (⋮) → <strong>Install app</strong> or <strong>Add to Home screen</strong>.
                </li>
                <li>Or use the Install button in the top bar when it appears.</li>
              </>
            )}
          </ol>
        )}

        <div className="flex flex-wrap gap-2 mt-3">
          <button type="button" className="btn-primary text-xs py-2 px-3" onClick={install}>
            <Download className="w-3.5 h-3.5" />
            {canPrompt ? 'Install app' : ios ? 'How to install' : 'Show install steps'}
          </button>
          <button type="button" className="btn-outline text-xs py-2 px-3" onClick={dismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
