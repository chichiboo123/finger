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
