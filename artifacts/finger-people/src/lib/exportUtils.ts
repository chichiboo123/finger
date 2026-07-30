import { getFontEmbedCSS, toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export type ExportStage = 'preparing' | 'rendering' | 'finishing' | 'done';

export interface ExportProgress {
  stage: ExportStage;
  /** 0–100. Never goes backwards, so a progress bar only ever fills up. */
  percent: number;
  /** Child-friendly description of what is happening right now. */
  message: string;
}

export type ExportProgressHandler = (progress: ExportProgress) => void;

const STAGES: Record<ExportStage, Omit<ExportProgress, 'stage'>> = {
  preparing: { percent: 12, message: '그림을 불러오고 있어요' },
  rendering: { percent: 45, message: '카드 이미지를 만들고 있어요' },
  finishing: { percent: 85, message: '파일로 저장하고 있어요' },
  done: { percent: 100, message: '모두 끝났어요!' },
};

function report(onProgress: ExportProgressHandler | undefined, stage: ExportStage) {
  onProgress?.({ stage, ...STAGES[stage] });
}

/** Yield to the browser so the progress UI can paint before the heavy work. */
function nextFrame() {
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

let fontEmbedCSS: string | undefined;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  return Promise.race([
    promise.catch(() => undefined),
    new Promise<undefined>(resolve => setTimeout(() => resolve(undefined), ms)),
  ]);
}

/**
 * The child's drawing is an `<img>` holding a PNG data URL. html-to-image only
 * copies the `src` across, so anything the browser has not finished loading and
 * decoding yet is exported as an empty box. Waiting here is what keeps the
 * drawing from disappearing on slower devices.
 */
function waitForImage(img: HTMLImageElement): Promise<unknown> {
  const loaded = img.complete && img.naturalWidth > 0
    ? Promise.resolve()
    : new Promise<void>(resolve => {
        const done = () => {
          img.removeEventListener('load', done);
          img.removeEventListener('error', done);
          resolve();
        };
        img.addEventListener('load', done);
        img.addEventListener('error', done);
      });

  // A broken or stalled image must not freeze the export forever.
  return withTimeout(loaded.then(() => img.decode?.()), 5000);
}

async function ensureImagesReady(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll('img'));
  await Promise.all(images.map(waitForImage));
}

// iOS Safari silently produces a blank or truncated canvas past these limits,
// so the scale factor drops instead of the whole export failing.
const MAX_CANVAS_SIDE = 4096;
const MAX_CANVAS_AREA = 16_777_216;

function pixelRatioFor(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);
  const byArea = Math.sqrt(MAX_CANVAS_AREA / (width * height));
  const bySide = Math.min(MAX_CANVAS_SIDE / width, MAX_CANVAS_SIDE / height);
  return Math.max(1, Math.min(2, byArea, bySide));
}

async function render(element: HTMLElement, onProgress?: ExportProgressHandler) {
  report(onProgress, 'preparing');
  await nextFrame();

  await ensureImagesReady(element);
  // Embedding fonts needs a network read; a failure must not lose the drawing.
  fontEmbedCSS ??= (await withTimeout(getFontEmbedCSS(element), 8000)) ?? '';

  const options = {
    pixelRatio: pixelRatioFor(element),
    backgroundColor: '#ffffff',
    cacheBust: false,
    fontEmbedCSS,
  };

  report(onProgress, 'rendering');

  // html-to-image draws the card through an SVG <foreignObject>. WebKit and some
  // Android WebViews fire that image's load event before the nested drawing has
  // been decoded, so the first pass comes out with the finger but no artwork. A
  // discarded warm-up pass primes the cache; it is skipped when the subtree has
  // no image that could go missing.
  const hasImages = element.querySelector('img') !== null;
  if (hasImages) await toPng(element, options);
  const dataUrl = await toPng(element, options);

  report(onProgress, 'finishing');
  return dataUrl;
}

/** Strip characters that break file names on Windows/macOS. */
function safeFilename(filename: string) {
  const cleaned = filename.replace(/[\\/:*?"<>|]+/g, '_').trim();
  return cleaned || 'fingerpeople.png';
}

async function toBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function exportToImage(
  element: HTMLElement,
  filename: string = 'fingerpeople.png',
  onProgress?: ExportProgressHandler,
) {
  const dataUrl = await render(element, onProgress);

  // Large PNGs are handed over as a blob URL: an <a href="data:..."> download is
  // refused or truncated by several mobile browsers.
  const blob = await toBlob(dataUrl);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = safeFilename(filename);
  link.href = url;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  // The anchor stays in the document for a moment: removing it in the same tick
  // makes some browsers forget the `download` name and save the file as
  // "download" with no extension.
  setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 10000);

  report(onProgress, 'done');
}

export async function copyToClipboard(
  element: HTMLElement,
  onProgress?: ExportProgressHandler,
): Promise<boolean> {
  try {
    const dataUrl = await render(element, onProgress);
    const blob = await toBlob(dataUrl);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    report(onProgress, 'done');
    return true;
  } catch (error) {
    console.error('Clipboard export failed', error);
    return false;
  }
}

export async function exportToPdf(
  element: HTMLElement,
  filename: string = 'fingerpeople.pdf',
  onProgress?: ExportProgressHandler,
) {
  const dataUrl = await render(element, onProgress);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const imgProps = pdf.getImageProperties(dataUrl);
  const margin = 8;
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW - margin * 2;
  const imgH = (imgProps.height * imgW) / imgProps.width;

  // Tall previews (10 cards stacked) must continue onto further pages instead
  // of being cropped at the bottom of page 1.
  let remaining = imgH;
  let offset = 0;
  while (remaining > 0) {
    if (offset > 0) pdf.addPage();
    pdf.addImage(dataUrl, 'PNG', margin, margin - offset, imgW, imgH);
    remaining -= pageH - margin * 2;
    offset += pageH - margin * 2;
  }

  pdf.save(safeFilename(filename));
  report(onProgress, 'done');
}
