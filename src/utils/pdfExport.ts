import { PageSize, PAGE_SIZE_SPECS } from '../types/cv';

// Helper to wait until all images in container have finished loading & decoding
async function waitForImagesToLoad(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) return;
      try {
        if ('decode' in img) {
          await img.decode();
        } else {
          await new Promise((resolve) => {
            const htmlImg = img as HTMLImageElement;
            htmlImg.onload = () => resolve(true);
            htmlImg.onerror = () => resolve(true); // Don't block if an image 404s
          });
        }
      } catch {
        // Fallback gracefully
      }
    })
  );
}

/**
 * Optimized Crisp PDF Exporter
 * - Dynamically loads jspdf and html2canvas-pro on demand
 * - Adaptive capture scale (2.5 on mobile, 3 on desktop, with max-dimension cap)
 * - Strict 1-page fit
 * - Frees canvas memory after saving
 */
export async function exportCVToPDF(
  elementId: string = 'cv-print-unscaled',
  candidateName: string = 'CV',
  forceSinglePage: boolean = true,
  pageSize: PageSize = 'a4'
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Unscaled print element with id "${elementId}" not found. Falling back to print dialog.`);
    window.print();
    return false;
  }

  const spec = PAGE_SIZE_SPECS[pageSize] || PAGE_SIZE_SPECS.a4;

  try {
    // 1. Concurrently load html2canvas-pro and jspdf only when user clicks Download
    const [html2canvasModule, jspdfModule] = await Promise.all([
      import('html2canvas-pro'),
      import('jspdf'),
    ]);

    const html2canvas = html2canvasModule.default || html2canvasModule;
    const jsPDF = jspdfModule.default || jspdfModule.jsPDF;

    // 2. Wait for document fonts to be completely ready
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 3. Wait for all images inside container to load completely
    await waitForImagesToLoad(element);

    // 4. Adaptive capture scale: 2.5 on mobile for speed/RAM, 3 on desktop, capped to safe max
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    let captureScale = isMobile ? 2.5 : 3;
    const maxDimension = Math.max(spec.widthPx, spec.heightPx);
    if (maxDimension * captureScale > 4096) {
      captureScale = Number((4096 / maxDimension).toFixed(2));
    }

    // 5. Capture with html2canvas-pro
    const canvas = await html2canvas(element, {
      scale: captureScale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: spec.widthPx,
      windowHeight: spec.heightPx,
      imageTimeout: 15000,
      removeContainer: true,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.textRendering = 'geometricPrecision';
          clonedEl.style.setProperty('-webkit-font-smoothing', 'antialiased');
          clonedEl.style.setProperty('-moz-osx-font-smoothing', 'grayscale');
          clonedEl.style.setProperty('image-rendering', '-webkit-optimize-contrast');

          // Force all SVG icons inside to render with geometric precision
          const svgs = clonedEl.querySelectorAll('svg');
          svgs.forEach((svg) => {
            svg.setAttribute('shape-rendering', 'geometricPrecision');
          });
        }
      },
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas render produced empty output');
    }

    // Initialize jsPDF with selected paper size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageSize === 'letter' ? 'letter' : pageSize === 'legal' ? 'legal' : 'a4',
      compress: true,
    });

    const targetWidthMm = spec.widthMm;
    const targetHeightMm = spec.heightMm;

    // Lossless PNG: every pixel and font glyph remains pin-sharp
    const imgData = canvas.toDataURL('image/png');

    // Single-Page Strict Fit: Fits completely onto exactly ONE page
    if (forceSinglePage) {
      const contentAspect = canvas.height / canvas.width;
      const paperAspect = targetHeightMm / targetWidthMm;

      if (contentAspect <= paperAspect) {
        // Fits width perfectly, height has slight margin or exact
        const renderHeight = targetWidthMm * contentAspect;
        pdf.addImage(imgData, 'PNG', 0, 0, targetWidthMm, Math.min(targetHeightMm, renderHeight), undefined, 'FAST');
      } else {
        // Content is slightly taller: fit by height so it never spills over
        const renderWidth = targetHeightMm / contentAspect;
        const offsetX = Math.max(0, (targetWidthMm - renderWidth) / 2);
        pdf.addImage(imgData, 'PNG', offsetX, 0, renderWidth, targetHeightMm, undefined, 'FAST');
      }
    } else {
      // Multi-page fallback if user explicitly requests multi-page
      const pageCanvasHeight = Math.floor((canvas.width * targetHeightMm) / targetWidthMm);
      const totalCanvasHeight = canvas.height;

      if (totalCanvasHeight <= pageCanvasHeight * 1.05) {
        pdf.addImage(imgData, 'PNG', 0, 0, targetWidthMm, targetHeightMm, undefined, 'FAST');
      } else {
        let renderedHeight = 0;
        let pageIndex = 0;

        while (renderedHeight < totalCanvasHeight) {
          const currentSliceHeight = Math.min(pageCanvasHeight, totalCanvasHeight - renderedHeight);

          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = currentSliceHeight;

          const pageCtx = pageCanvas.getContext('2d');
          if (pageCtx) {
            pageCtx.fillStyle = '#ffffff';
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            pageCtx.drawImage(
              canvas,
              0,
              renderedHeight,
              canvas.width,
              currentSliceHeight,
              0,
              0,
              canvas.width,
              currentSliceHeight
            );

            if (pageIndex > 0) {
              pdf.addPage();
            }

            const sliceHeightMm = (currentSliceHeight * targetWidthMm) / canvas.width;
            const sliceImgData = pageCanvas.toDataURL('image/png');
            pdf.addImage(sliceImgData, 'PNG', 0, 0, targetWidthMm, sliceHeightMm, undefined, 'FAST');
            pageCanvas.width = 0;
            pageCanvas.height = 0;
          }

          renderedHeight += currentSliceHeight;
          pageIndex++;
        }
      }
    }

    // Free main canvas memory immediately
    canvas.width = 0;
    canvas.height = 0;

    // Sanitize candidate name for filename: <CandidateName>_CV.pdf
    const sanitizedName =
      candidateName
        .trim()
        .replace(/[^a-zA-Z0-9_\u0980-\u09FF\s-]/g, '')
        .replace(/\s+/g, '_') || 'Candidate';

    pdf.save(`${sanitizedName}_CV.pdf`);
    return true;
  } catch (error) {
    console.error('Error during direct PDF generation:', error);
    throw error;
  }
}
