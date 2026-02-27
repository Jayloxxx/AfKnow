/**
 * PDF export for AfKnow map editor.
 * Generates a print-ready PDF with map, legend, metadata.
 */
import { jsPDF } from 'jspdf';

export interface LegendEntryPdf {
  label: string;
  color: string;
  symbol?: string;
}

export interface PdfExportOptions {
  mapImageDataUrl: string;
  mapName: string;
  legendEntries: LegendEntryPdf[];
  legendTitle: string;
  pageSize: 'a4' | 'a3';
  orientation: 'portrait' | 'landscape';
  classification?: string;
  showNorthArrow: boolean;
  showScaleBar: boolean;
  showDate: boolean;
  attribution: string;
}

export async function exportToPdf(opts: PdfExportOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: opts.orientation === 'landscape' ? 'l' : 'p',
    unit: 'mm',
    format: opts.pageSize,
  });

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 10;
  const classH = opts.classification ? 7 : 0;

  // ── Classification header ──
  if (opts.classification) {
    doc.setFillColor(180, 0, 0);
    doc.rect(0, 0, pw, classH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'bold');
    doc.text(opts.classification, pw / 2, classH - 2, { align: 'center' });
  }

  // ── Title ──
  const titleY = classH + 8;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text(opts.mapName, pw / 2, titleY, { align: 'center' });

  // ── Map image ──
  const mapTop = titleY + 5;
  const mapW = pw - margin * 2;
  const mapAspect = 1100 / 1000;
  let mapH = mapW * mapAspect;
  const maxMapH = ph - mapTop - (opts.legendEntries.length > 0 ? 35 : 15) - classH;
  if (mapH > maxMapH) mapH = maxMapH;
  const actualMapW = mapH / mapAspect;
  const mapX = (pw - actualMapW) / 2;

  doc.addImage(opts.mapImageDataUrl, 'PNG', mapX, mapTop, actualMapW, mapH);

  // Map border
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.rect(mapX, mapTop, actualMapW, mapH);

  // ── North arrow ──
  if (opts.showNorthArrow) {
    const nax = mapX + actualMapW - 8;
    const nay = mapTop + 5;
    doc.setFillColor(50, 50, 50);
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.4);
    // Arrow line
    doc.line(nax, nay + 10, nax, nay);
    // Arrow head
    doc.triangle(nax, nay - 1, nax - 2, nay + 3, nax + 2, nay + 3, 'F');
    // N label
    doc.setFontSize(6);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(50, 50, 50);
    doc.text('N', nax, nay - 2, { align: 'center' });
  }

  // ── Scale bar ──
  if (opts.showScaleBar) {
    const sbx = mapX + 5;
    const sby = mapTop + mapH - 5;
    const sbw = 30; // ~500km representation
    doc.setDrawColor(50, 50, 50);
    doc.setFillColor(50, 50, 50);
    doc.setLineWidth(0.5);
    doc.line(sbx, sby, sbx + sbw, sby);
    doc.line(sbx, sby - 1.5, sbx, sby + 1.5);
    doc.line(sbx + sbw, sby - 1.5, sbx + sbw, sby + 1.5);
    doc.setFontSize(5);
    doc.setTextColor(50, 50, 50);
    doc.text('0', sbx, sby + 3);
    doc.text('~500 km', sbx + sbw, sby + 3, { align: 'right' });
  }

  // ── Legend ──
  const legendY = mapTop + mapH + 5;
  if (opts.legendEntries.length > 0) {
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text(opts.legendTitle || 'Legende', margin, legendY + 3);

    const cols = Math.min(4, Math.ceil(opts.legendEntries.length / 3));
    const colW = (pw - margin * 2) / cols;
    const entryH = 5;
    let col = 0;
    let row = 0;

    opts.legendEntries.forEach((entry) => {
      const ex = margin + col * colW;
      const ey = legendY + 7 + row * entryH;

      // Color swatch
      const rgb = hexToRgb(entry.color);
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(ex, ey, 4, 3, 'F');

      // Label
      doc.setFontSize(6);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(entry.label, ex + 6, ey + 2.5);

      row++;
      if (row >= 4) { row = 0; col++; }
    });
  }

  // ── Footer ──
  const footerY = ph - (opts.classification ? classH + 2 : 4);
  doc.setFontSize(6);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(140, 140, 140);
  if (opts.showDate) {
    doc.text(new Date().toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' }), margin, footerY);
  }
  doc.text(opts.attribution || 'AfKnow Intelligence Platform', pw - margin, footerY, { align: 'right' });

  // ── Classification footer ──
  if (opts.classification) {
    doc.setFillColor(180, 0, 0);
    doc.rect(0, ph - classH, pw, classH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('Helvetica', 'bold');
    doc.text(opts.classification, pw / 2, ph - 2, { align: 'center' });
  }

  doc.save(`${opts.mapName.replace(/\s+/g, '_')}.pdf`);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const num = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
