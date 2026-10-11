import React, { useState } from 'react';
import { CVLogo } from './CVLogo';
import { CheckCircle2, Download, Smartphone, X, Sparkles, Monitor, ArrowRight } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<'accepted' | 'dismissed' | 'unsupported'>;
  isIOS: boolean;
  isInstallable: boolean;
  onOpenIOSGuide: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isIOS,
  isInstallable,
  onOpenIOSGuide,
}) => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      onClose();
      onOpenIOSGuide();
      return;
    }

    if (!isInstallable) {
      // Browser doesn't have native beforeinstallprompt (e.g., Firefox, or already installed, or restricted)
      setStatusMessage('To install: click your browser menu (⋮) and select "Install CV Maker" or "Add to Home Screen".');
      return;
    }

    setIsInstalling(true);
    setStatusMessage(null);
    try {
      const outcome = await onInstall();
      if (outcome === 'accepted') {
        try {
          const confettiModule = await import('canvas-confetti');
          const confetti = confettiModule.default || confettiModule;
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#0d9488', '#0ea5e9', '#38bdf8', '#ffffff'],
          });
        } catch {
          // ignore if confetti fails
        }
        setStatusMessage('CV Maker installed successfully!');
        setTimeout(() => {
          onClose();
        }, 1400);
      } else if (outcome === 'dismissed') {
        // User cancelled in browser dialog
        setStatusMessage('Installation was cancelled. You can install anytime using the header button.');
        setTimeout(() => {
          setStatusMessage(null);
        }, 3500);
      } else {
        setStatusMessage('To install: open browser settings (⋮) and tap "Install app" or "Add to Home screen".');
      }
    } catch {
      setStatusMessage('Installation could not be completed. Use your browser menu to install.');
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        {/* Top decorative gradient bar */}
        <div className="h-2 w-full bg-linear-to-r from-teal-500 via-sky-500 to-teal-600" />

        {/* Close / Skip button in corner */}
        <button
          onClick={onClose}
          aria-label="Skip installation"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3.5 mb-4">
            <CVLogo size="lg" variant="dark" className="rounded-xl shadow-md ring-2 ring-teal-500/20" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900">CV Maker</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  PWA
                </span>
              </div>
              <p className="text-xs text-slate-500">Fast, offline-ready & standalone app</p>
            </div>
          </div>

          {/* Title & Message as strictly specified */}
          <h2 id="install-dialog-title" className="text-lg font-bold text-slate-900 mb-2">
            Install CV Maker
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            Install CV Maker on your device for quick access and a convenient app-like experience.
          </p>

          {/* Feature Highlights */}
          <div className="bg-slate-50 rounded-xl p-3.5 mb-5 space-y-2 border border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Full offline editing & instant PDF export</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Quick home screen access with no app store needed</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Optimized full-screen workspace on mobile and desktop</span>
            </div>
          </div>

          {/* Feedback/Status message */}
          {statusMessage && (
            <div className="mb-4 p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium animate-in fade-in">
              {statusMessage}
            </div>
          )}

          {/* Action Buttons: "Install" and "Skip" */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isInstalling}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-100 active:bg-slate-200 transition focus:outline-hidden focus:ring-2 focus:ring-slate-400 cursor-pointer"
            >
              Skip
            </button>
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold shadow-md shadow-teal-600/20 hover:shadow-lg transition flex items-center justify-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
