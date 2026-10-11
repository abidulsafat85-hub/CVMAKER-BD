import React, { useState, useEffect } from 'react';
import { CVData } from './types/cv';
import { INITIAL_CV_DATA } from './data/initialData';
import { Header } from './components/Header';
import { CVEditor } from './components/Editor/CVEditor';
import { CVPreview } from './components/Preview/CVPreview';
import { ImageCropperModal } from './components/ImageCropperModal';
import { InstallModal } from './components/InstallModal';
import { IOSInstallGuideModal } from './components/IOSInstallGuideModal';
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
};

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

  // Auto-save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(cvData));
    } catch {
      // safe fallback
    }
  }, [cvData]);

  // Profile Photo Cropper state
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  const handleRequestCrop = (imageSrc: string) => {
    setRawImageSrc(imageSrc);
    setIsCropperOpen(true);
  };

  const handleCropComplete = (croppedBase64: string) => {
    setCvData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        avatarUrl: croppedBase64,
        showAvatar: true,
      },
    }));
    showToast(lang === 'bn' ? 'ছবি সফলভাবে যুক্ত করা হয়েছে!' : 'High-definition photo applied!');
  };

  // Mobile navigation tab: 'editor' | 'preview'
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'preview'>('editor');

  // Preview zoom scale controls (Generous default for PC screens: 1.0 / 100% scale)
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isWidePreviewMode, setIsWidePreviewMode] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setZoomScale(0.48);
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
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      // Guarantee single page fit without spilling onto page 2
      await exportCVToPDF('cv-print-unscaled', cvData.personal.fullName || 'Candidate', true);
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

  const handlePrint = () => {
    window.print();
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
        activeMobileTab={activeMobileTab}
        setActiveMobileTab={setActiveMobileTab}
        lang={lang}
        onToggleLang={toggleLanguage}
      />

      {/* Main Workspace with Wide Desktop Grid for PC Screens */}
      <main className="screen-only flex-1 max-w-[1680px] w-full mx-auto p-3 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
          <div className="w-full max-w-[860px] mb-3 flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs no-print text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                {t.livePreviewTitle}
              </span>
              {/* Single Page Guarantee Badge */}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                {t.fitOnePageActive}
              </span>
            </div>

            {/* Desktop Zoom & View Controls */}
            <div className="flex items-center gap-2">
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
                  onClick={() => setZoomScale(1.0)}
                  title="Reset to 100% Actual A4 Size"
                  className="px-1.5 py-0.5 rounded text-[10.5px] font-semibold text-slate-600 hover:text-teal-700 hover:bg-white transition cursor-pointer"
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
          <div className="w-full overflow-x-auto flex justify-center pb-12 pt-1">
            <div
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.12s ease-out',
                marginBottom: `calc((1123px * ${zoomScale}) - 1123px)`,
              }}
            >
              <CVPreview data={cvData} isPdfMode={false} />
            </div>
          </div>
        </section>
      </main>

      {/* SEPARATE HIDDEN UNSCALED A4 ELEMENT (794px width, unscaled, pure hex/rgb) */}
      {/* Captured by html2canvas-pro for 1-Page PDF and print */}
      <div
        aria-hidden="true"
        className="print-wrapper-root"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '794px',
          backgroundColor: '#ffffff',
          zIndex: -100,
          pointerEvents: 'none',
        }}
      >
        <div id="cv-print-unscaled" className="print-document-target" style={{ width: '794px', backgroundColor: '#ffffff' }}>
          <CVPreview data={cvData} isPdfMode={true} />
        </div>
      </div>

      {/* Image Cropper Modal (Passport 3:4 & 1:1 with auto white background) */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={rawImageSrc}
        onClose={() => setIsCropperOpen(false)}
        onCropComplete={handleCropComplete}
        lang={lang}
      />

      {/* PWA Install Modal */}
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

      {/* iOS Installation Instructions Modal */}
      <IOSInstallGuideModal
        isOpen={showIOSGuide}
        onClose={() => setShowIOSGuide(false)}
        isIOS={isIOS}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
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
