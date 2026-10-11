import React, { useState, useEffect, useRef, useDeferredValue, Suspense } from 'react';
import { CVData, PageSize, PAGE_SIZE_SPECS } from './types/cv';
import { INITIAL_CV_DATA } from './data/initialData';
import { Header } from './components/Header';
import { CVEditor } from './components/Editor/CVEditor';
import { CVPreview } from './components/Preview/CVPreview';

const ImageCropperModal = React.lazy(() =>
  import('./components/ImageCropperModal').then((m) => ({ default: m.ImageCropperModal }))
);
const InstallModal = React.lazy(() =>
  import('./components/InstallModal').then((m) => ({ default: m.InstallModal }))
);
const IOSInstallGuideModal = React.lazy(() =>
  import('./components/IOSInstallGuideModal').then((m) => ({ default: m.IOSInstallGuideModal }))
);
import { usePWAInstall } from './pwa/usePWAInstall';
import { useOnlineStatus } from './pwa/useOnlineStatus';
import { setupServiceWorker } from './pwa/registerServiceWorker';
import { exportCVToPDF } from './utils/pdfExport';
import { Language, TRANSLATIONS } from './data/translations';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  FileCheck,
  AlertCircle,
  X,
  Printer,
  Sliders,
  FileText,
  Eye,
  Download,
  Loader2,
  Pencil,
} from 'lucide-react';

const CV_STORAGE_KEY = 'cv_maker_document_data_v4';
const LANG_STORAGE_KEY = 'cv_maker_language_pref_v2';

const EMPTY_CV_DATA: CVData = {
  personal: {
    fullName: '',
    jobTitle: '',
    avatarUrl: '',
    showAvatar: false,
    gender: '',
    phone: '',
    website: '',
    birthDate: '',
    email: '',
    presentAddress: {
      country: 'Bangladesh',
      divisionState: '',
      district: '',
      thanaCity: '',
      streetRoadPostCode: '',
    },
    permanentAddress: {
      country: 'Bangladesh',
      divisionState: '',
      district: '',
      thanaCity: '',
      streetRoadPostCode: '',
    },
    sameAsPresentAddress: true,
    socialAccounts: [],
  },
  objective: '',
  education: [],
  workExperience: [],
  trainingCourses: [],
  projects: [],
  activities: [],
  skillCategories: [],
  honorsAwards: [],
  certifications: [],
  references: [],
  interests: '',
  themeColor: '#389ba8',
  fontFamily: 'Inter',
  template: 'teal-split',
  pageSize: 'a4',
};

// Helper: resize to max 600px & compress to JPEG 0.85 to keep localStorage small & fast
async function compressAvatar(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = 600;
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL('image/jpeg', 0.85);
      canvas.width = 0;
      canvas.height = 0;
      resolve(compressed);
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

export default function App() {
  // Initialize Service Worker
  useEffect(() => {
    setupServiceWorker();
  }, []);

  // Language state: English / Bengali
  const [lang, setLang] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
      if (savedLang === 'bn' || savedLang === 'en') return savedLang;
    } catch {
      // ignore
    }
    return 'en';
  });

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'en' ? 'bn' : 'en';
    setLang(nextLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch {
      // ignore
    }
  };

  const t = TRANSLATIONS[lang];

  // PWA & Connectivity hooks
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isFirstVisitCandidate,
    install,
    skipPrompt,
  } = usePWAInstall();

  const isOnline = useOnlineStatus();

  // Dialog states
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  // Trigger first-visit modal when eligible
  useEffect(() => {
    if (isFirstVisitCandidate && !isInstalled) {
      const timer = setTimeout(() => {
        setShowInstallModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisitCandidate, isInstalled]);

  // CV Data State with LocalStorage Persistence (default completely blank on new open)
  const [cvData, setCvData] = useState<CVData>(() => {
    try {
      const saved = localStorage.getItem(CV_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.personal?.fullName === 'ABIDUL ISLAM SAFAT' ||
          parsed.personal?.fullName === 'Your Name'
        ) {
          return EMPTY_CV_DATA;
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return EMPTY_CV_DATA;
  });

  // Keep deferred copy of CV data so typing in editor stays instant
  const deferredCvData = useDeferredValue(cvData);

  // Debounced auto-save to LocalStorage (250ms) with friendly storage-full notification
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(cvData));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
        showToast(
          lang === 'bn'
            ? 'সতর্কতা: স্টোরেজ পূর্ণ হয়েছে, সিভি ডাউনলোড করে সংরক্ষণ করুন।'
            : 'Storage full. Please download your CV.'
        );
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [cvData, lang]);

  // Profile Photo Cropper state
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  const handleRequestCrop = React.useCallback((imageSrc: string) => {
    setRawImageSrc(imageSrc);
    setIsCropperOpen(true);
  }, []);

  const handleCropComplete = async (croppedBase64: string) => {
    const optimizedPhoto = await compressAvatar(croppedBase64);
    setCvData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        avatarUrl: optimizedPhoto,
        showAvatar: true,
      },
    }));
    showToast(lang === 'bn' ? 'ছবি সফলভাবে যুক্ত করা হয়েছে!' : 'Photo applied!');
  };

  // Mobile navigation tab: 'editor' | 'preview'
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor');

  // Preview zoom scale controls (Generous default for PC screens: 1.0 / 100% scale)
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isWidePreviewMode, setIsWidePreviewMode] = useState<boolean>(false);

  // Avoid layout thrash: ignore mobile virtual keyboard height changes
  const lastWidthRef = useRef<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width === lastWidthRef.current) return;
      lastWidthRef.current = width;

      const currentSpec = PAGE_SIZE_SPECS[(cvData.pageSize as PageSize) || 'a4'];
      const paperWidth = currentSpec.widthPx;

      if (width < 640) {
        // Fit exact paper width inside mobile screen width with comfortable side margins
        const availableWidth = Math.max(280, width - 20);
        const fitScale = Number((availableWidth / paperWidth).toFixed(3));
        setZoomScale(fitScale);
      } else if (width < 1024) {
        setZoomScale(0.70);
      } else if (width < 1400) {
        setZoomScale(0.95);
      } else {
        // Desktop PC monitors: comfortable 100% scale
        setZoomScale(1.0);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [cvData.pageSize]);

  // PDF Export state
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pdfErrorMessage, setPdfErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    setPdfErrorMessage(null);
    try {
      // Allow browser to mount the unscaled print copy and process fonts
      await new Promise((r) => setTimeout(r, 80));
      await exportCVToPDF(
        'cv-print-unscaled',
        cvData.personal.fullName || 'Candidate',
        true,
        (cvData.pageSize as PageSize) || 'a4'
      );
      showToast(lang === 'bn' ? '১ পৃষ্ঠার পিডিএফ সফলভাবে ডাউনলোড হয়েছে!' : '1-Page PDF downloaded successfully!');
    } catch (err: unknown) {
      console.error('PDF generation error:', err);
      setPdfErrorMessage(
        lang === 'bn'
          ? 'পিডিএফ তৈরিতে সমস্যা হয়েছে। আপনি নিচের "প্রিন্ট / সেভ করুন" বোতাম চেপে ব্রাউজার থেকে সেভ করতে পারেন।'
          : 'Direct PDF export encountered an issue. Please use the "Print / Save as PDF" button below to save via your browser.'
      );
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePrint = async () => {
    setIsExportingPDF(true);
    await new Promise((r) => setTimeout(r, 80));
    window.print();
    setTimeout(() => setIsExportingPDF(false), 500);
  };

  const handleResetSample = () => {
    if (window.confirm(t.resetConfirm)) {
      setCvData(INITIAL_CV_DATA);
      showToast(lang === 'bn' ? 'নমুনা তথ্য লোড করা হয়েছে!' : 'Sample data loaded!');
    }
  };

  const handleClearAllData = () => {
    if (window.confirm(t.clearConfirm)) {
      setCvData(EMPTY_CV_DATA);
      showToast(lang === 'bn' ? 'সব তথ্য মুছে ফেলা হয়েছে!' : 'All data cleared!');
    }
  };

  const handleHeaderInstallClick = () => {
    if (isIOS) {
      setShowIOSGuide(true);
    } else if (isInstallable) {
      setShowInstallModal(true);
    } else {
      setShowIOSGuide(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Website Header with Brand, Stylish CV Logo, Language Toggle, and Controls */}
      <Header
        isInstalled={isInstalled}
        isInstallable={isInstallable}
        isIOS={isIOS}
        onTriggerInstall={handleHeaderInstallClick}
        onDownloadPDF={handleDownloadPDF}
        isExportingPDF={isExportingPDF}
        onPrint={handlePrint}
        onResetSample={handleResetSample}
        onClearAllData={handleClearAllData}
        isOnline={isOnline}
        lang={lang}
        onToggleLang={toggleLanguage}
      />

      {/* Main Workspace with Wide Desktop Grid for PC Screens */}
      <main className="screen-only flex-1 max-w-[1680px] w-full mx-auto p-3 sm:p-5 lg:p-6 pb-24 lg:pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: CV Editor Form (Collapsible when Wide Preview is active) */}
        <section
          aria-label="CV Editor"
          className={`${
            isWidePreviewMode ? 'hidden' : 'lg:col-span-5'
          } h-[calc(100vh-6.5rem)] sticky top-20 no-print ${
            activeMobileTab === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          <CVEditor
            data={cvData}
            onChange={setCvData}
            onRequestCrop={handleRequestCrop}
            lang={lang}
          />
        </section>

        {/* RIGHT PANE: Live Preview (Takes full width if Wide Mode active, or 7 columns on Desktop) */}
        <section
          aria-label="Live CV Preview"
          className={`${
            isWidePreviewMode ? 'lg:col-span-12' : 'lg:col-span-7'
          } flex flex-col items-center ${
            activeMobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Preview Controls Bar */}
          <div className="w-full max-w-[860px] mb-3 flex items-center justify-between bg-white px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs no-print text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>{t.livePreviewTitle}</span>
              </span>

              {/* Page Size Selector (A4, Letter, Legal) */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
                {(['a4', 'letter', 'legal'] as PageSize[]).map((pSize) => {
                  const spec = PAGE_SIZE_SPECS[pSize];
                  const isSelected = (cvData.pageSize || 'a4') === pSize;
                  return (
                    <button
                      key={pSize}
                      type="button"
                      onClick={() => {
                        const newCv = { ...cvData, pageSize: pSize };
                        setCvData(newCv);
                        // Readjust mobile zoom scale if necessary
                        if (window.innerWidth < 640) {
                          const fitScale = Number((Math.max(280, window.innerWidth - 24) / spec.widthPx).toFixed(3));
                          setZoomScale(Math.min(0.65, Math.max(0.38, fitScale)));
                        }
                      }}
                      title={spec.label}
                      className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {pSize.toUpperCase()}
                    </button>
                  );
                })}
              </div>

              {/* Single Page Guarantee Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t.fitOnePageActive}
              </span>
            </div>

            {/* Preview Action Controls */}
            <div className="flex items-center gap-2">
              {/* Mobile-only Download PDF button in Preview */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className="flex lg:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.generatingPdf}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadPdf}</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))))}
                  title="Zoom Out"
                  className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-1.5 font-bold text-slate-800 min-w-11 text-center">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomScale((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))))}
                  title="Zoom In"
                  className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const activeSpec = PAGE_SIZE_SPECS[(cvData.pageSize as PageSize) || 'a4'];
                    if (window.innerWidth < 640) {
                      const fitScale = Number((Math.max(280, window.innerWidth - 24) / activeSpec.widthPx).toFixed(3));
                      setZoomScale(Math.min(0.65, Math.max(0.38, fitScale)));
                    } else {
                      setZoomScale(1.0);
                    }
                  }}
                  title={lang === 'bn' ? 'স্ক্রিনে ফিট করুন' : 'Fit to Screen'}
                  className="px-2 py-1 rounded text-[11px] font-bold text-teal-700 hover:text-teal-850 hover:bg-white transition cursor-pointer"
                >
                  Fit
                </button>
                <button
                  type="button"
                  onClick={() => setZoomScale(1.0)}
                  title="Reset to 100% Actual Size"
                  className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[10.5px] font-semibold text-slate-600 hover:text-teal-700 hover:bg-white transition cursor-pointer"
                >
                  100%
                </button>
              </div>

              {/* Desktop Wide Preview Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsWidePreviewMode(!isWidePreviewMode)}
                title={isWidePreviewMode ? 'Split View with Editor' : 'Focus Preview on Full Desktop Screen'}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                <Maximize2 className="w-3.5 h-3.5 text-teal-600" />
                <span>{isWidePreviewMode ? 'Split View' : 'Wide View'}</span>
              </button>
            </div>
          </div>

          {/* Scaled Preview Wrapper for Interactive Screen View */}
          <div className="w-full overflow-x-auto flex justify-center pb-12 pt-1 px-1">
            {(() => {
              const activeSpec = PAGE_SIZE_SPECS[(cvData.pageSize as PageSize) || 'a4'];
              const scaledWidth = Math.round(activeSpec.widthPx * zoomScale);
              const scaledHeight = Math.round(activeSpec.heightPx * zoomScale);

              return (
                <div
                  style={{
                    width: `${scaledWidth}px`,
                    height: `${scaledHeight}px`,
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: `${activeSpec.widthPx}px`,
                      height: `${activeSpec.heightPx}px`,
                      transform: `scale(${zoomScale})`,
                      transformOrigin: 'top left',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  >
                    <CVPreview data={deferredCvData} isPdfMode={false} />
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      </main>

      {/* SEPARATE HIDDEN UNSCALED ELEMENT (width/height dynamically matched to chosen page size) */}
      {/* Lazily mounted ONLY when exporting PDF or printing to save CPU & RAM */}
      {isExportingPDF && (() => {
        const activeSpec = PAGE_SIZE_SPECS[(cvData.pageSize as PageSize) || 'a4'];
        return (
          <div
            aria-hidden="true"
            className="print-wrapper-root"
            style={{
              position: 'absolute',
              left: '-9999px',
              top: 0,
              width: `${activeSpec.widthPx}px`,
              backgroundColor: '#ffffff',
              zIndex: -100,
              pointerEvents: 'none',
            }}
          >
            <div
              id="cv-print-unscaled"
              className="print-document-target"
              style={{ width: `${activeSpec.widthPx}px`, backgroundColor: '#ffffff' }}
            >
              <CVPreview data={cvData} isPdfMode={true} />
            </div>
          </div>
        );
      })()}

      {/* Lazy Suspense Modals (Zero code loaded until user opens them) */}
      <Suspense fallback={null}>
        {isCropperOpen && (
          <ImageCropperModal
            isOpen={isCropperOpen}
            imageSrc={rawImageSrc}
            onClose={() => setIsCropperOpen(false)}
            onCropComplete={handleCropComplete}
            lang={lang}
          />
        )}

        {showInstallModal && (
          <InstallModal
            isOpen={showInstallModal}
            onClose={() => {
              setShowInstallModal(false);
              skipPrompt();
            }}
            onInstall={install}
            isIOS={isIOS}
            isInstallable={isInstallable}
            onOpenIOSGuide={() => setShowIOSGuide(true)}
          />
        )}

        {showIOSGuide && (
          <IOSInstallGuideModal
            isOpen={showIOSGuide}
            onClose={() => setShowIOSGuide(false)}
            isIOS={isIOS}
          />
        )}
      </Suspense>

      {/* Mobile Bottom Docked Box (2 Tabs: Edit CV & Preview - ONLY for Phones) */}
      <nav
        aria-label="Mobile View Switcher"
        className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.09)] px-3 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex items-center justify-center no-print"
      >
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/90 w-full max-w-sm shadow-inner">
          {/* Edit CV Tab Button */}
          <button
            type="button"
            onClick={() => setActiveMobileTab('editor')}
            aria-label="Edit CV"
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 min-h-[48px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMobileTab === 'editor'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 active:bg-white/80'
            }`}
          >
            <Pencil className="w-4 h-4 shrink-0" />
            <span className="truncate">{lang === 'bn' ? 'এডিট সিভি' : 'Edit CV'}</span>
          </button>

          {/* Preview Tab Button */}
          <button
            type="button"
            onClick={() => setActiveMobileTab('preview')}
            aria-label="Preview CV"
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 min-h-[48px] rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMobileTab === 'preview'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-[1.01]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 active:bg-white/80'
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span className="truncate">{lang === 'bn' ? 'প্রিভিউ' : 'Preview'}</span>
          </button>
        </div>
      </nav>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <FileCheck className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error Alert Modal if direct PDF export fails */}
      {pdfErrorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'bn' ? 'পিডিএফ ডাউনলোডে ত্রুটি' : 'PDF Export Notice'}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {pdfErrorMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPdfErrorMessage(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPdfErrorMessage(null);
                  handlePrint();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t.printPdf}</span>
              </button>
              <button
                type="button"
                onClick={() => setPdfErrorMessage(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
              >
                {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
