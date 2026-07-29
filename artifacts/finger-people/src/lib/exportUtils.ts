import { getFontEmbedCSS, toPng } from 'html-to-image';
import jsPDF from 'jspdf';

let fontEmbedCSS: string | undefined;

/** Render once and reuse embedded font CSS; the old warm-up render doubled every wait. */
async function render(element: HTMLElement) {
  fontEmbedCSS ??= await getFontEmbedCSS(element);
  const options = { pixelRatio: 2, backgroundColor: '#ffffff', cacheBust: false, fontEmbedCSS };
  return toPng(element, options);
}

export async function exportToImage(element: HTMLElement, filename: string = 'fingerpeople.png') {
  const dataUrl = await render(element);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function copyToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const dataUrl = await render(element);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (error) {
    console.error('Clipboard export failed', error);
    return false;
  }
}

async function renderBlob(element: HTMLElement): Promise<Blob> {
  const dataUrl = await render(element);
  const response = await fetch(dataUrl);
  return response.blob();
}

export async function exportToPdf(element: HTMLElement, filename: string = 'fingerpeople.pdf') {
  const dataUrl = await render(element);
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

  pdf.save(filename);
}

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'unsupported';

/**
 * Share the rendered cards themselves instead of the app URL. Character data
 * lives only in IndexedDB, and putting a drawing data URL in the address would
 * create an unusably long link. A PNG keeps the share small and portable.
 */
export async function shareImage(element: HTMLElement, filename = 'fingerpeople.png'): Promise<ShareResult> {
  let blob: Blob;
  try {
    blob = await renderBlob(element);
  } catch (error) {
    console.error('Share rendering failed', error);
    return 'unsupported';
  }

  const file = new File([blob], filename, { type: 'image/png' });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title: '나의 핑거피플',
        text: '내가 만든 핑거피플 인물 카드예요!',
        files: [file],
      });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      // Sharing may be blocked by the browser; fall through to image copy.
    }
  }

  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return 'copied';
  } catch {
    return 'unsupported';
  }
}
