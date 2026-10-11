import React from 'react';
import { CVLogo } from './CVLogo';
import { Share, PlusSquare, X, Smartphone, Globe, ExternalLink } from 'lucide-react';

interface IOSInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
}

export const IOSInstallGuideModal: React.FC<IOSInstallGuideModalProps> = ({
  isOpen,
  onClose,
  isIOS,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200">
        <div className="h-1.5 w-full bg-linear-to-r from-teal-500 to-sky-500" />

        <button
          onClick={onClose}
          aria-label="Close guide"
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CVLogo size="md" variant="dark" className="rounded-xl shadow-xs" />
            <div>
              <h2 id="guide-dialog-title" className="text-base font-bold text-slate-900">
                {isIOS ? 'Install CV Maker on iOS' : 'How to Install CV Maker'}
              </h2>
              <p className="text-xs text-slate-500">Quick steps to add the app to your Home Screen</p>
            </div>
          </div>

          {isIOS ? (
            <div className="space-y-3.5 my-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 font-bold text-sm">
                  1
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Tap the <strong className="text-slate-900">Share</strong> button in Safari's bottom toolbar.
                  <div className="mt-1 flex items-center gap-1.5 text-sky-600 font-medium">
                    <Share className="w-3.5 h-3.5" />
                    <span>Square with upward arrow</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 font-bold text-sm">
                  2
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Scroll down the menu and tap <strong className="text-slate-900">Add to Home Screen</strong>.
                  <div className="mt-1 flex items-center gap-1.5 text-teal-600 font-medium">
                    <PlusSquare className="w-3.5 h-3.5" />
                    <span>"Add to Home Screen" option</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-sm">
                  3
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                  Confirm the name <strong className="text-slate-900">"CV Maker"</strong> and tap <strong className="text-slate-900">Add</strong> in the top-right corner.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 my-4 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-teal-600" />
                  Chrome or Edge on Desktop:
                </div>
                <p>Click the <strong>Install</strong> icon in the address bar (right side), or open the browser menu (⋮) &gt; <strong>Install CV Maker</strong>.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  Android Devices:
                </div>
                <p>Tap the menu icon (⋮) in Chrome and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</p>
              </div>
            </div>
          )}

          <div className="mt-5">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
