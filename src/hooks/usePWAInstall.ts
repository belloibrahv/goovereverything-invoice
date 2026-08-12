'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

type Listener = () => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<Listener>();
let listening = false;

function emit() {
  listeners.forEach((l) => l());
}

function ensureInstallListener() {
  if (typeof window === 'undefined' || listening) return;
  listening = true;

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    emit();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    emit();
  });
}

function subscribe(listener: Listener) {
  ensureInstallListener();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getDeferredSnapshot() {
  return deferredPrompt;
}

function getServerSnapshot() {
  return null;
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function usePWAInstall() {
  const deferred = useSyncExternalStore(subscribe, getDeferredSnapshot, getServerSnapshot);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ensureInstallListener();
    setMounted(true);
    setStandalone(isStandaloneDisplay());
    setIos(isIOSDevice());

    const mq = window.matchMedia('(display-mode: standalone)');
    const onChange = () => setStandalone(isStandaloneDisplay());
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const canPrompt = Boolean(deferred) && !standalone;
  const canInstall = mounted && !standalone;

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    emit();
    return choice.outcome === 'accepted';
  }, [deferred]);

  return {
    mounted,
    standalone,
    ios,
    canPrompt,
    canInstall,
    deferred,
    promptInstall,
  };
}
