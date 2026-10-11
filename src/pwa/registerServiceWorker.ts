import { registerSW } from 'virtual:pwa-register';

export function setupServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        console.log('CV Maker: New content available. Auto-updating service worker.');
      },
      onOfflineReady() {
        console.log('CV Maker: App is offline-ready.');
      },
      onRegisterError(error: unknown) {
        console.warn('CV Maker: Service worker registration failed:', error);
      },
    });
    return updateSW;
  }
  return undefined;
}
