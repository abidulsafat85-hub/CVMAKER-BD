import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const SKIP_STORAGE_KEY = 'cv_maker_install_skipped';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [isFirstVisitCandidate, setIsFirstVisitCandidate] = useState(false);

  useEffect(() => {
    // 1. Check standalone (installed)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
      return isStandalone;
    };

    const standaloneNow = checkStandalone();

    // 2. Check iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // 3. Check skip preference safely
    try {
      const skipped = sessionStorage.getItem(SKIP_STORAGE_KEY) === 'true' ||
                      localStorage.getItem(SKIP_STORAGE_KEY) === 'true';
      setHasSkipped(skipped);
    } catch {
      setHasSkipped(false);
    }

    // 4. Listen for Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // If not installed and hasn't skipped, mark as candidate for first-visit prompt
      if (!standaloneNow) {
        try {
          const alreadySkipped =
            sessionStorage.getItem(SKIP_STORAGE_KEY) === 'true' ||
            localStorage.getItem(SKIP_STORAGE_KEY) === 'true';
          if (!alreadySkipped) {
            setIsFirstVisitCandidate(true);
          }
        } catch {
          setIsFirstVisitCandidate(true);
        }
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsFirstVisitCandidate(false);
      try {
        localStorage.setItem('cv_maker_is_installed', 'true');
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If iOS and not standalone and not skipped, we also consider first-visit prompt candidate
    if (isIOSDevice && !standaloneNow) {
      try {
        const alreadySkipped =
          sessionStorage.getItem(SKIP_STORAGE_KEY) === 'true' ||
          localStorage.getItem(SKIP_STORAGE_KEY) === 'true';
        if (!alreadySkipped) {
          setIsFirstVisitCandidate(true);
        }
      } catch {
        setIsFirstVisitCandidate(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    if (!deferredPrompt) {
      return 'unsupported';
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        setIsFirstVisitCandidate(false);
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.error('Error during PWA installation:', err);
      return 'dismissed';
    }
  }, [deferredPrompt]);

  const skipPrompt = useCallback(() => {
    setHasSkipped(true);
    setIsFirstVisitCandidate(false);
    try {
      sessionStorage.setItem(SKIP_STORAGE_KEY, 'true');
      localStorage.setItem(SKIP_STORAGE_KEY, 'true');
    } catch {
      // safe fallback
    }
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    hasSkipped,
    isFirstVisitCandidate,
    install,
    skipPrompt,
    deferredPrompt,
  };
}
