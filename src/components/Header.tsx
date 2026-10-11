import React from 'react';
import { CVLogo } from './CVLogo';
import { Download, Printer, Smartphone, Check, WifiOff, RotateCcw, Trash2, Languages, Edit3, Eye, Loader2 } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface HeaderProps {
  isInstalled: boolean;
  isInstallable: boolean;
  isIOS: boolean;
  onTriggerInstall: () => void;
  onDownloadPDF: () => void;
  isExportingPDF: boolean;
  onPrint: () => void;
  onResetSample: () => void;
  onClearAllData: () => void;
  isOnline: boolean;
  activeMobileTab: 'editor' | 'preview';
  setActiveMobileTab: (tab: 'editor' | 'preview') => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isInstalled,
  isInstallable,
  isIOS,
  onTriggerInstall,
  onDownloadPDF,
  isExportingPDF,
  onPrint,
  onResetSample,
  onClearAllData,
  isOnline,
  activeMobileTab,
  setActiveMobileTab,
  lang,
  onToggleLang,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand & Stylish CV Logo */}
        <div className="flex items-center gap-3">
          <CVLogo size="md" variant="dark" className="rounded-xl shadow-xs" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                CV Maker
              </span>
              <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/80">
                PWA
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Mobile Tab Switcher (Editor vs Preview) */}
        <div className="flex lg:hidden items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveMobileTab('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeMobileTab === 'editor'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t.editor}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
              activeMobileTab === 'preview'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.preview}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Offline indicator if disconnected */}
          {!isOnline && (
            <div
              title={t.offlineNotice}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Offline</span>
            </div>
          )}

          {/* Language Toggle: English / Bengali */}
          <button
            type="button"
            onClick={onToggleLang}
            title={lang === 'en' ? 'Switch to Bengali' : 'Switch to English'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Languages className="w-3.5 h-3.5 text-teal-600" />
            <span>{lang === 'en' ? 'Bengali' : 'English'}</span>
          </button>

          {/* Load Sample Data */}
          <button
            type="button"
            onClick={onResetSample}
            title={t.resetSample}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetSample}</span>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={onClearAllData}
            title={t.clearAllData}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium transition flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{t.clearAllData}</span>
          </button>

          {/* Fallback: Print / Save as PDF */}
          <button
            type="button"
            onClick={onPrint}
            title={t.printPdf}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.printPdf}</span>
          </button>

          {/* Persistent Install App Button */}
          {!isInstalled ? (
            <button
              type="button"
              onClick={onTriggerInstall}
              title={isIOS ? 'Install on iPhone / iPad' : 'Install CV Maker App'}
              aria-label="Install CV Maker application"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition shadow-2xs group cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
              <span className="hidden xs:inline">{t.installApp}</span>
            </button>
          ) : (
            <span
              title="CV Maker is running as an installed PWA"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200"
            >
              <Check className="w-3 h-3 text-teal-600" />
              <span>{t.installed}</span>
            </span>
          )}

          {/* Download PDF Button with Loading Spinner */}
          <button
            type="button"
            onClick={onDownloadPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-teal-700/20 hover:shadow-md transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                <span>{t.generatingPdf}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{t.downloadPdf}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
