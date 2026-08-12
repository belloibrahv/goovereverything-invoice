'use client';

import { Toaster } from 'react-hot-toast';
import { ServiceWorkerRegister } from './ServiceWorkerRegister';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ServiceWorkerRegister />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    </>
  );
}
