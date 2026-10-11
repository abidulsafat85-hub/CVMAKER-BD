import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { ZoomIn, RotateCw, X, Check, Crop, Sparkles, Wand2, Loader2, Eye, EyeOff } from 'lucide-react';
import { TRANSLATIONS, Language } from '../data/translations';
import { processPhotoWithAI } from '../utils/aiBackgroundRemoval';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
  lang: Language;
}

// Generate base cropped canvas from source image preserving natural 1:1 crisp resolution (NO digital blur)
async function createCroppedCanvas(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<HTMLCanvasElement> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });

  // Preserve native 1:1 cropped dimensions - never force-upscale which causes blurriness (jafsa)
  const targetWidth = Math.max(10, Math.round(pixelCrop.width));
  const targetHeight = Math.max(10, Math.round(pixelCrop.height));

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Cannot get canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (rotation !== 0) {
    ctx.save();
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-targetWidth / 2, -targetHeight / 2);
  }

  // Draw 1:1 original pixel fidelity
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  if (rotation !== 0) {
    ctx.restore();
  }

  return canvas;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [aspect, setAspect] = useState<number>(3 / 4);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Per user instruction: White Background and Enhance must START OFF (default: false)
  const [whiteBg, setWhiteBg] = useState<boolean>(false);
  const [enhance, setEnhance] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Live Instant Preview state (when user turns ON, works immediately - "sate sate koj korbe")
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(false);

  const onCropAreaComplete = useCallback((_croppedArea: Area, currentPixels: Area) => {
    setCroppedAreaPixels(currentPixels);
  }, []);

  // Real-time generator when user enables whiteBg or enhance ("jokon on korbe sate sate koj korbe")
  const generateLivePreview = useCallback(async (enableWhite: boolean, enableEnhance: boolean) => {
    if (!imageSrc || !croppedAreaPixels) return;

    // If both are off, turn off preview mode
    if (!enableWhite && !enableEnhance) {
      setIsPreviewActive(false);
      setPreviewImage(null);
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage(
        lang === 'bn'
          ? 'এআই ইনস্ট্যান্ট প্রসেসিং হচ্ছে...'
          : 'AI processing instant preview...'
      );

      const croppedCanvas = await createCroppedCanvas(imageSrc, croppedAreaPixels, rotation);
      const processed = await processPhotoWithAI(croppedCanvas, {
        applyWhiteBg: enableWhite,
        enhanceClarity: enableEnhance,
        targetWidth: croppedCanvas.width,
        targetHeight: croppedCanvas.height,
      });

      setPreviewImage(processed);
      setIsPreviewActive(true);
    } catch (err) {
      console.error('Instant preview error', err);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  }, [imageSrc, croppedAreaPixels, rotation, lang]);

  // When toggles change, if either is ON, generate preview immediately ("sate sate koj korbe")
  const handleToggleWhiteBg = (newVal: boolean) => {
    setWhiteBg(newVal);
    generateLivePreview(newVal, enhance);
  };

  const handleToggleEnhance = (newVal: boolean) => {
    setEnhance(newVal);
    generateLivePreview(whiteBg, newVal);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    // If preview is already ready and matches current toggles, use it directly!
    if (isPreviewActive && previewImage) {
      onCropComplete(previewImage);
      onClose();
      return;
    }

    setIsProcessing(true);
    setStatusMessage(
      lang === 'bn'
        ? 'ছবি নিখুঁতভাবে সেভ করা হচ্ছে...'
        : 'Saving crisp photo...'
    );

    try {
      // 1. Crop at 1:1 original pixel quality (never blurred)
      const croppedCanvas = await createCroppedCanvas(
        imageSrc,
        croppedAreaPixels,
        rotation
      );

      // 2. If neither whiteBg nor enhance is active, output crystal-clear original crop
      if (!whiteBg && !enhance) {
        onCropComplete(croppedCanvas.toDataURL('image/jpeg', 0.98));
        onClose();
        return;
      }

      // 3. Process with AI
      const finalImage = await processPhotoWithAI(croppedCanvas, {
        applyWhiteBg: whiteBg,
        enhanceClarity: enhance,
        targetWidth: croppedCanvas.width,
        targetHeight: croppedCanvas.height,
      });

      onCropComplete(finalImage);
      onClose();
    } catch (e) {
      console.error('Failed to crop and enhance image', e);
      try {
        const croppedCanvas = await createCroppedCanvas(
          imageSrc,
          croppedAreaPixels,
          rotation
        );
        onCropComplete(croppedCanvas.toDataURL('image/jpeg', 0.98));
        onClose();
      } catch (fallbackErr) {
        console.error('Fallback crop failed', fallbackErr);
      }
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-teal-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t.cropTitle}</h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'bn'
                  ? 'ক্রপ করুন এবং প্রয়োজন অনুযায়ী হোয়াইট ব্যাকগ্রাউন্ড ও শার্পনেস যুক্ত করুন'
                  : 'Crop precisely and toggle AI white background or clarity enhancer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper Canvas or Instant Live Preview */}
        <div className="relative w-full h-72 sm:h-80 bg-slate-950 flex items-center justify-center overflow-hidden">
          {isPreviewActive && previewImage ? (
            <div className="relative w-full h-full flex items-center justify-center bg-slate-900 p-4">
              <img
                src={previewImage}
                alt="AI Enhanced Preview"
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg border border-slate-700 bg-white"
              />
              <div className="absolute top-3 left-3 bg-teal-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'লাইভ প্রিভিউ (নিখুঁত রেজাল্ট)' : 'Live AI Result'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewActive(false)}
                className="absolute top-3 right-3 bg-slate-800/80 hover:bg-slate-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs cursor-pointer"
              >
                <Crop className="w-3 h-3" />
                <span>{lang === 'bn' ? 'ক্রপ মোড' : 'Edit Crop'}</span>
              </button>
            </div>
          ) : (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropAreaComplete}
            />
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white z-20 space-y-3 p-4">
              <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
              <p className="text-xs font-semibold text-center">{statusMessage}</p>
            </div>
          )}
        </div>

        {/* Adjustments */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-3">
          {/* White Background & Enhance Controls (Default OFF, when ON works immediately) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* White Background Option */}
            <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
              whiteBg ? 'bg-teal-50 border-teal-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 shrink-0 ${whiteBg ? 'text-teal-600' : 'text-slate-400'}`} />
                <div>
                  <span className="font-bold text-slate-800 block leading-tight">
                    {lang === 'bn' ? 'হোয়াইট ব্যাকগ্রাউন্ড' : 'White Background'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {whiteBg
                      ? (lang === 'bn' ? 'চালু (সাদা ব্যাকগ্রাউন্ড)' : 'Active (Pure white)')
                      : (lang === 'bn' ? 'বন্ধ (আসল ব্যাকগ্রাউন্ড)' : 'Off (Original background)')}
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={whiteBg}
                  disabled={isProcessing}
                  onChange={(e) => handleToggleWhiteBg(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>

            {/* Clarity Enhancer Option (Anti-Blur, Super-Sharp) */}
            <div className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
              enhance ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Wand2 className={`w-4 h-4 shrink-0 ${enhance ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <span className="font-bold text-slate-800 block leading-tight">
                    {lang === 'bn' ? 'ফটো এনহ্যান্স (শার্প)' : 'Clarity Enhancer'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {enhance
                      ? (lang === 'bn' ? 'চালু (কোনো ঝাপসা ভাব নেই)' : 'Active (Ultra-sharp)')
                      : (lang === 'bn' ? 'বন্ধ (স্বাভাবিক শার্পনেস)' : 'Off (Normal clarity)')}
                  </span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={enhance}
                  disabled={isProcessing}
                  onChange={(e) => handleToggleEnhance(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Aspect Ratio Buttons */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">
              {lang === 'bn' ? 'অনুপাত:' : 'Aspect Ratio:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setAspect(3 / 4);
                  setIsPreviewActive(false);
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  aspect === 3 / 4
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.aspect34}
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setAspect(1);
                  setIsPreviewActive(false);
                }}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  aspect === 1
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t.aspect11}
              </button>
            </div>
          </div>

          {/* Zoom & Rotation Sliders */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="flex items-center gap-3">
              <ZoomIn className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                disabled={isProcessing || isPreviewActive}
                onChange={(e) => {
                  setZoom(Number(e.target.value));
                  setIsPreviewActive(false);
                }}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 w-8 text-right font-medium">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <div className="flex items-center gap-3">
              <RotateCw className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="range"
                value={rotation}
                min={0}
                max={360}
                step={1}
                disabled={isProcessing || isPreviewActive}
                onChange={(e) => {
                  setRotation(Number(e.target.value));
                  setIsPreviewActive(false);
                }}
                className="w-full accent-teal-600 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500 w-8 text-right font-medium">
                {rotation}°
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            {(whiteBg || enhance) && previewImage && (
              <button
                type="button"
                onClick={() => setIsPreviewActive((prev) => !prev)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 cursor-pointer"
              >
                {isPreviewActive ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'ক্রপ পরিবর্তন' : 'Edit Crop'}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'প্রিভিউ দেখুন' : 'View AI Result'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition cursor-pointer disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === 'bn' ? 'প্রসেসিং...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.saveCrop}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
