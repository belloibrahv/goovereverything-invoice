'use client';

import { useEffect } from 'react';

/**
 * Ensures the service worker is registered on production deploys.
 * next-pwa also registers, but this covers App Router edge cases and
 * retries if the first attempt races the build artifact.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    const register = async () => {
      try {
        const existing = await navigator.serviceWorker.getRegistration();
        if (existing) return;
        await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      } catch (err) {
        console.warn('Service worker registration failed', err);
      }
    };

    // Wait a tick so next-pwa's injected register can run first
    const t = window.setTimeout(register, 1500);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
