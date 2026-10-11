// AI Selfie Segmentation & Ultra-Sharp Portrait Enhancement for CV Photos

declare global {
  interface Window {
    SelfieSegmentation?: any;
  }
}

let selfieSegmentationInstance: any = null;
let initPromise: Promise<any> | null = null;

// Initialize singleton MediaPipe SelfieSegmentation model
async function getSelfieSegmentation() {
  if (selfieSegmentationInstance) {
    return selfieSegmentationInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      let SelfieClass = window.SelfieSegmentation;
      if (!SelfieClass) {
        const module = await import('@mediapipe/selfie_segmentation');
        SelfieClass = module.SelfieSegmentation || (module as any).default?.SelfieSegmentation;
      }

      if (!SelfieClass) {
        throw new Error('SelfieSegmentation class not found');
      }

      const instance = new SelfieClass({
        locateFile: (file: string) => {
          return `/mediapipe/${file}`;
        },
      });

      instance.setOptions({
        modelSelection: 1, // 1 = landscape/accurate model (high fidelity)
        selfieMode: false,
      });

      await instance.initialize();
      selfieSegmentationInstance = instance;
      return instance;
    } catch (err) {
      console.warn('Could not initialize local MediaPipe, attempting CDN fallback...', err);
      try {
        let SelfieClass = window.SelfieSegmentation;
        if (!SelfieClass) {
          const module = await import('@mediapipe/selfie_segmentation');
          SelfieClass = module.SelfieSegmentation || (module as any).default?.SelfieSegmentation;
        }

        const instance = new SelfieClass({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });

        instance.setOptions({
          modelSelection: 1,
          selfieMode: false,
        });

        await instance.initialize();
        selfieSegmentationInstance = instance;
        return instance;
      } catch (cdnErr) {
        console.error('MediaPipe initialization failed completely:', cdnErr);
        throw cdnErr;
      }
    }
  })();

  return initPromise;
}

// Hermite smoothstep for sharp edge anti-aliasing without blur halos
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

// Edge-Refining Mask Processor: eliminates the 15-pixel blurry halo
function refineSegmentationMask(
  maskCanvas: HTMLCanvasElement,
  width: number,
  height: number
) {
  const ctx = maskCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const totalPixels = width * height;

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;
    // MediaPipe mask alpha or red channel represents confidence (0 to 255)
    const confidence = Math.max(data[idx], data[idx + 3]);

    // Tight threshold transition: 85 to 145 instead of 0 to 255
    // Eliminates soft blurry feathering while keeping sub-pixel edge smoothness
    const refined = smoothstep(85, 145, confidence) * 255;
    const finalAlpha = Math.round(refined);

    data[idx] = 255;
    data[idx + 1] = 255;
    data[idx + 2] = 255;
    data[idx + 3] = finalAlpha;
  }

  ctx.putImageData(imgData, 0, 0);
}

// Professional Luminance Unsharp Mask Filter (Zero color fringing, crystal sharp details)
export function applyCrispSharpeningFilter(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  strength: number = 0.38
) {
  const original = new Uint8ClampedArray(data);

  // Pre-calculate luminance for each pixel
  const lum = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    lum[i] = 0.299 * original[idx] + 0.587 * original[idx + 1] + 0.114 * original[idx + 2];
  }

  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    for (let x = 1; x < width - 1; x++) {
      const idx = (rowOffset + x) * 4;
      const centerLum = lum[rowOffset + x];

      // Laplacian kernel on luminance
      const topLum = lum[(y - 1) * width + x];
      const bottomLum = lum[(y + 1) * width + x];
      const leftLum = lum[rowOffset + (x - 1)];
      const rightLum = lum[rowOffset + (x + 1)];

      const laplacian = 4 * centerLum - (topLum + bottomLum + leftLum + rightLum);

      // Noise gate: only sharpen real edge transitions, ignore skin noise
      if (Math.abs(laplacian) > 2.5) {
        // Clamp maximum edge boost to prevent halos
        const delta = Math.max(-28, Math.min(28, laplacian * strength));

        data[idx] = Math.min(255, Math.max(0, Math.round(original[idx] + delta)));
        data[idx + 1] = Math.min(255, Math.max(0, Math.round(original[idx + 1] + delta)));
        data[idx + 2] = Math.min(255, Math.max(0, Math.round(original[idx + 2] + delta)));
      }
    }
  }
}

// Subtle Studio Micro-Contrast Boost for vibrant, non-washed-out skin and eyes
export function applyStudioContrast(
  data: Uint8ClampedArray,
  width: number,
  height: number
) {
  const total = width * height * 4;
  for (let i = 0; i < total; i += 4) {
    for (let c = 0; c < 3; c++) {
      let v = data[i + c] / 255;
      // Gentle S-curve contrast
      v = v < 0.5 ? 2 * v * v : 1 - 2 * (1 - v) * (1 - v);
      // Blend 80% original + 20% contrast curve for natural pop
      const blended = (data[i + c] * 0.82) + (v * 255 * 0.18);
      data[i + c] = Math.min(255, Math.max(0, Math.round(blended)));
    }
  }
}

// Main AI background removal & crispness enhancement pipeline
export async function processPhotoWithAI(
  sourceCanvas: HTMLCanvasElement,
  options: {
    applyWhiteBg: boolean;
    enhanceClarity: boolean;
    targetWidth?: number;
    targetHeight?: number;
  }
): Promise<string> {
  const { applyWhiteBg, enhanceClarity } = options;
  const width = options.targetWidth || sourceCanvas.width;
  const height = options.targetHeight || sourceCanvas.height;

  // Intermediate canvas at natural resolution
  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = width;
  cropCanvas.height = height;
  const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
  if (!cropCtx) throw new Error('Cannot get 2d context');

  cropCtx.imageSmoothingEnabled = true;
  cropCtx.imageSmoothingQuality = 'high';
  cropCtx.drawImage(sourceCanvas, 0, 0, width, height);

  // If user only wants enhance, no white background:
  if (!applyWhiteBg) {
    if (enhanceClarity) {
      const imgData = cropCtx.getImageData(0, 0, width, height);
      applyCrispSharpeningFilter(imgData.data, width, height, 0.40);
      applyStudioContrast(imgData.data, width, height);
      cropCtx.putImageData(imgData, 0, 0);
    }
    return cropCanvas.toDataURL('image/jpeg', 0.98);
  }

  // Composite canvas for white background
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
  if (!outCtx) throw new Error('Cannot get 2d context for output');

  try {
    const segmenter = await getSelfieSegmentation();

    // Run AI segmentation
    const rawMask = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('AI Segmentation timeout'));
      }, 7000);

      segmenter.onResults((results: any) => {
        clearTimeout(timeout);
        if (results && results.segmentationMask) {
          resolve(results.segmentationMask);
        } else {
          reject(new Error('No segmentation mask returned'));
        }
      });

      segmenter.send({ image: cropCanvas }).catch((err: any) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    // 1. Draw raw mask onto offscreen mask canvas and sharpen the edges
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext('2d', { willReadFrequently: true })!;
    maskCtx.imageSmoothingEnabled = true;
    maskCtx.imageSmoothingQuality = 'high';
    maskCtx.drawImage(rawMask, 0, 0, width, height);

    // Refine mask to eliminate blurry halo
    refineSegmentationMask(maskCanvas, width, height);

    // 2. Fill background with pure studio white #FFFFFF
    outCtx.fillStyle = '#ffffff';
    outCtx.fillRect(0, 0, width, height);

    // 3. Create isolated crisp foreground with original high-res person
    const fgCanvas = document.createElement('canvas');
    fgCanvas.width = width;
    fgCanvas.height = height;
    const fgCtx = fgCanvas.getContext('2d')!;
    fgCtx.imageSmoothingEnabled = true;
    fgCtx.imageSmoothingQuality = 'high';

    // Draw high-resolution person
    fgCtx.drawImage(cropCanvas, 0, 0, width, height);

    // Mask out background using the razor-sharp refined mask
    fgCtx.globalCompositeOperation = 'destination-in';
    fgCtx.drawImage(maskCanvas, 0, 0, width, height);

    // 4. Composite person onto pure white studio background
    outCtx.drawImage(fgCanvas, 0, 0);

  } catch (error) {
    console.warn('AI Segmentation error, preserving clean crop:', error);
    // Draw original without destroying or blurring image
    outCtx.drawImage(cropCanvas, 0, 0);
  }

  // 5. Anti-Blur & Crispness filter (if requested or by default with white bg)
  if (enhanceClarity) {
    const finalData = outCtx.getImageData(0, 0, width, height);
    applyCrispSharpeningFilter(finalData.data, width, height, 0.42);
    applyStudioContrast(finalData.data, width, height);
    outCtx.putImageData(finalData, 0, 0);
  }

  return outputCanvas.toDataURL('image/jpeg', 0.98);
}
