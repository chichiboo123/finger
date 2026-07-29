import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/** Rendering the DOM twice warms the webfont/image cache and avoids blank first frames. */
async function render(element: HTMLElement) {
  const options = { pixelRatio: 2, backgroundColor: '#ffffff', cacheBust: true };
  await toPng(element, options);
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

export type ShareResult = 'shared' | 'copied' | 'unsupported';

/**
 * All character data lives in this browser's IndexedDB, so a URL cannot carry
 * it. This shares the app address only — callers must say so in their message.
 */
export async function shareLink(): Promise<ShareResult> {
  const url = window.location.origin + import.meta.env.BASE_URL;

  if (navigator.share) {
    try {
      await navigator.share({ title: '핑거피플', text: '핑거피플로 나만의 인물을 만들어 보세요!', url });
      return 'shared';
    } catch (error) {
      // User dismissed the sheet, or sharing is blocked — fall through to copy.
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'unsupported';
  }
}
