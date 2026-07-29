import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportToImage(element: HTMLElement, filename: string = 'fingerpeople.png') {
  const dataUrl = await toPng(element, { pixelRatio: 2 });
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function copyToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const dataUrl = await toPng(element, { pixelRatio: 2 });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  } catch (error) {
    console.error("Clipboard export failed", error);
    return false;
  }
}

export async function exportToPdf(element: HTMLElement, filename: string = 'fingerpeople.pdf') {
  const dataUrl = await toPng(element, { pixelRatio: 2 });
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const imgProps = pdf.getImageProperties(dataUrl);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}

export async function shareLink() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: '핑거피플',
        text: '내가 만든 핑거피플을 만나보세요!',
        url: window.location.href,
      });
      return true;
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }
  
  try {
    await navigator.clipboard.writeText(window.location.href);
    return 'copied';
  } catch (err) {
    return false;
  }
}