import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

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
 * Ultra-Sharp Crystal HD PDF Exporter
 * - Captured at scale: 4 (3,176 x 4,492 px @ ~384 DPI print-master resolution)
 * - Lossless PNG encoding (zero JPEG block distortion, zero blurry halos, 100% crisp typography)
 * - Guaranteed single-page fit without spilling onto page 2
 * - High-zoom proof: Text and lines remain razor sharp even at high zoom
 */
export async function exportCVToPDF(
  elementId: string = 'cv-print-unscaled',
  candidateName: string = 'CV',
  forceSinglePage: boolean = true
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Unscaled print element with id "${elementId}" not found. Falling back to print dialog.`);
    window.print();
    return false;
  }

  try {
    // 1. Wait for document fonts to be completely ready
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // 2. Wait for all images inside container to load completely
    await waitForImagesToLoad(element);

    // 3. Capture with html2canvas-pro at Ultra-HD scale (scale: 4 for ~384 DPI crystal clarity)
    // 794px * 4 = 3,176px; 1123px * 4 = 4,492px
    const canvas = await html2canvas(element, {
      scale: 4,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      windowHeight: 1123,
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

    // Standard A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const a4WidthMm = 210;
    const a4HeightMm = 297;

    // Use LOSSLESS PNG instead of JPEG.
    // JPEG introduces compression artifacts and blurry fringes around text glyphs when zoomed in.
    // PNG is 100% lossless: every pixel, edge, and character remains pin-sharp!
    const imgData = canvas.toDataURL('image/png');

    // Single-Page Strict Fit: Fits completely onto exactly ONE page without spilling onto page 2!
    if (forceSinglePage) {
      const contentAspect = canvas.height / canvas.width;
      const a4Aspect = a4HeightMm / a4WidthMm; // ~1.414

      if (contentAspect <= a4Aspect) {
        // Fits width perfectly, height has slight margin or exact
        const renderHeight = a4WidthMm * contentAspect;
        pdf.addImage(imgData, 'PNG', 0, 0, a4WidthMm, Math.min(a4HeightMm, renderHeight), undefined, 'FAST');
      } else {
        // Content is slightly taller: fit by height so it NEVER spills onto page 2!
        const renderWidth = a4HeightMm / contentAspect;
        const offsetX = Math.max(0, (a4WidthMm - renderWidth) / 2);
        pdf.addImage(imgData, 'PNG', offsetX, 0, renderWidth, a4HeightMm, undefined, 'FAST');
      }
    } else {
      // Multi-page fallback if user explicitly requests multi-page
      const pageCanvasHeight = Math.floor((canvas.width * a4HeightMm) / a4WidthMm);
      const totalCanvasHeight = canvas.height;

      if (totalCanvasHeight <= pageCanvasHeight * 1.05) {
        pdf.addImage(imgData, 'PNG', 0, 0, a4WidthMm, a4HeightMm, undefined, 'FAST');
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

            const sliceHeightMm = (currentSliceHeight * a4WidthMm) / canvas.width;
            const sliceImgData = pageCanvas.toDataURL('image/png');
            pdf.addImage(sliceImgData, 'PNG', 0, 0, a4WidthMm, sliceHeightMm, undefined, 'FAST');
          }

          renderedHeight += currentSliceHeight;
          pageIndex++;
        }
      }
    }

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
