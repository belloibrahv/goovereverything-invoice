'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setStandalone(isStandalone);

    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    const dismissed = localStorage.getItem('samidak-pwa-dismissed') === '1';

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (!dismissed && !isStandalone) setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // Show iOS tip if not installed
    if (ios && !isStandalone && !dismissed) {
      const t = window.setTimeout(() => setVisible(true), 2500);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      };
    }

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  if (standalone || !visible) return null;

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('samidak-pwa-dismissed', '1');
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-[70] p-3 sm:p-4 pointer-events-none safe-bottom">
      <div className="pointer-events-auto mx-auto max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl p-4 flex gap-3 items-start">
        <div className="p-2 rounded-lg bg-red-50 text-brand-red shrink-0">
          <Download className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">Install SAMIDAK</p>
          <p className="text-xs text-gray-600 mt-1">
            {isIOS && !deferred
              ? 'On iPhone/iPad: tap Share, then “Add to Home Screen” for offline access.'
              : 'Install the app for quick access and offline use on this device.'}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {deferred && (
              <button type="button" className="btn-primary text-xs py-2 px-3" onClick={install}>
                Install app
              </button>
            )}
            <button type="button" className="btn-outline text-xs py-2 px-3" onClick={dismiss}>
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
