'use client';

import { useEffect } from 'react';

/**
 * One-time cleanup for users whose browsers still hold a stale service-worker
 * registration / CacheStorage entries from an earlier build of this app.
 * There is no longer any SW registration in this codebase; this component
 * just unregisters leftovers. Remove once the old registration has aged out
 * of your dev browsers (check: DevTools → Application → Service Workers).
 */
export default function ServiceWorkerCleaner() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const r of registrations) {
          r.unregister();
        }
      });
    }
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
  }, []);

  return null;
}
