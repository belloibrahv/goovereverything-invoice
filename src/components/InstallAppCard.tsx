'use client';

import { Download, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

/** Compact install CTA for dashboard / settings */
export function InstallAppCard({ compact = false }: { compact?: boolean }) {
  const { mounted, canInstall, canPrompt, ios, promptInstall, standalone } = usePWAInstall();

  if (!mounted) return null;

  if (standalone) {
    return (
      <div className="card p-4 sm:p-5 flex gap-3 items-start border-green-100 bg-green-50/50">
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900 text-sm">Installed as an app</p>
          <p className="text-xs text-gray-600 mt-1">
            You&apos;re using the home-screen app. Your documents stay on this device and work offline.
          </p>
        </div>
      </div>
    );
  }

  if (!canInstall) return null;

  return (
    <div className={`card p-4 sm:p-5 ${compact ? '' : 'border-brand-red/20 bg-red-50/30'}`}>
      <div className="flex gap-3 items-start">
        <div className="p-2 rounded-lg bg-red-50 text-brand-red shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="font-semibold text-gray-900 text-sm sm:text-base">
              Download SAMIDAK to your phone
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Install once — open it from your home screen like a normal app, even without internet.
            </p>
          </div>

          {ios ? (
            <ol className="text-xs text-gray-700 space-y-1.5 bg-white/80 rounded-lg border border-gray-100 p-3">
              <li className="flex gap-2 items-start">
                <Share className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <span>
                  In <strong>Safari</strong>, tap <strong>Share</strong>
                </span>
              </li>
              <li className="flex gap-2 items-start">
                <PlusSquare className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                <span>
                  Tap <strong>Add to Home Screen</strong> → Add
                </span>
              </li>
            </ol>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              {canPrompt ? (
                <button type="button" className="btn-primary w-full sm:w-auto" onClick={() => promptInstall()}>
                  <Download className="w-4 h-4" /> Install app
                </button>
              ) : (
                <ol className="text-xs text-gray-700 space-y-1 list-decimal list-inside bg-white/80 rounded-lg border border-gray-100 p-3 w-full">
                  <li>Open this site in Chrome on your phone</li>
                  <li>
                    Tap menu (⋮) → <strong>Install app</strong> or <strong>Add to Home screen</strong>
                  </li>
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
