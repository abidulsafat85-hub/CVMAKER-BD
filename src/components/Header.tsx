import React, { useState, useRef, useEffect } from 'react';
import { CVLogo } from './CVLogo';
import {
  Download,
  Printer,
  Smartphone,
  Check,
  WifiOff,
  RotateCcw,
  Trash2,
  Languages,
  Loader2,
  MoreVertical,
  X,
  FileDown,
} from 'lucide-react';
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
  lang,
  onToggleLang,
}) => {
  const t = TRANSLATIONS[lang];
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
        setShowClearConfirm(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand & Stylish CV Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <CVLogo size="md" variant="dark" className="rounded-xl shadow-xs w-8 h-8 sm:w-10 sm:h-10" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 leading-none">
                CV Maker-BD
              </span>
              <span className="hidden xs:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                BD
              </span>
            </div>
            <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Offline indicator if disconnected */}
          {!isOnline && (
            <div
              title={t.offlineNotice}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-medium"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden md:inline">Offline</span>
            </div>
          )}

          {/* Language Switcher with globe icon */}
          <button
            type="button"
            onClick={onToggleLang}
            title={lang === 'en' ? 'Switch to Bengali (বাংলা)' : 'Switch to English'}
            aria-label="Switch language"
            className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 min-h-[38px] sm:min-h-0 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            <Languages className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-teal-600 shrink-0" />
            <span className="text-xs">{lang === 'en' ? 'বাংলা' : 'English'}</span>
          </button>

          {/* Mobile Direct Download PDF button in Header */}
          <button
            type="button"
            onClick={onDownloadPDF}
            disabled={isExportingPDF}
            title={t.downloadPdf}
            aria-label={t.downloadPdf}
            className="flex md:hidden items-center justify-center gap-1 px-3 py-1.5 min-h-[38px] rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-xs shadow-teal-700/20 transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px] font-semibold">{lang === 'bn' ? 'তৈরি...' : 'PDF...'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">PDF</span>
              </>
            )}
          </button>

          {/* Desktop Only: Load Sample Data */}
          <button
            type="button"
            onClick={onResetSample}
            title={t.resetSample}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.resetSample}</span>
          </button>

          {/* Desktop Only: Clear All Data */}
          <button
            type="button"
            onClick={onClearAllData}
            title={t.clearAllData}
            className="hidden md:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium transition items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{t.clearAllData}</span>
          </button>

          {/* Desktop Only: Fallback Print / Save as PDF */}
          <button
            type="button"
            onClick={onPrint}
            title={t.printPdf}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.printPdf}</span>
          </button>

          {/* Desktop Persistent Install App Button */}
          {!isInstalled ? (
            <button
              type="button"
              onClick={onTriggerInstall}
              title={isIOS ? 'Install on iPhone / iPad' : 'Install CV Maker App'}
              aria-label="Install CV Maker application"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 text-xs font-semibold transition shadow-2xs group cursor-pointer"
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

          {/* Desktop Download PDF Button */}
          <button
            type="button"
            onClick={onDownloadPDF}
            disabled={isExportingPDF}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-teal-700/20 hover:shadow-md transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
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

          {/* Mobile "More" Menu Button (3 dots) */}
          <div className="relative md:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setShowMoreMenu(!showMoreMenu);
                setShowClearConfirm(false);
              }}
              title="More actions"
              aria-label="More options"
              aria-expanded={showMoreMenu}
              className={`p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl border transition cursor-pointer ${
                showMoreMenu
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Mobile Dropdown Menu */}
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in">
                {/* Install App in mobile menu */}
                {!isInstalled && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoreMenu(false);
                      onTriggerInstall();
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left text-slate-700 hover:bg-teal-50 hover:text-teal-800 transition cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="font-medium">{t.installApp}</span>
                  </button>
                )}

                {/* Print / Save as PDF in mobile menu */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onPrint();
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-medium">{t.printPdf}</span>
                </button>

                {/* Load Sample CV */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(false);
                    onResetSample();
                  }}
                  className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left text-slate-700 hover:bg-slate-50 transition cursor-pointer border-t border-slate-100"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-medium">{t.resetSample}</span>
                </button>

                {/* Clear All Data with in-menu confirmation */}
                {!showClearConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="w-full px-3.5 py-2.5 flex items-center gap-2.5 text-left text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-medium">{t.clearAllData}</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-red-50 border-t border-red-100 space-y-2">
                    <p className="text-[11px] text-red-700 font-semibold leading-tight">
                      {lang === 'bn' ? 'সব তথ্য মুছে ফাঁকা করবেন?' : 'Clear all CV data completely?'}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          setShowClearConfirm(false);
                          onClearAllData();
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-red-600 text-white font-bold text-[11px] hover:bg-red-700 text-center cursor-pointer"
                      >
                        {lang === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Clear'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        className="py-1 px-2 rounded-lg bg-slate-200 text-slate-700 font-medium text-[11px] hover:bg-slate-300 cursor-pointer"
                      >
                        {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

