/**
 * Timeline export utilities — PNG series & animated GIF.
 */
import type { TimelinePhase } from '../components/editor/types';

/**
 * Render the editor SVG for a given phase to a canvas, then return as Blob.
 */
async function renderSvgToCanvas(
  svgEl: SVGSVGElement,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  // Serialize to blob URL
  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Apply phase visibility to SVG clone — hide elements not matching the phase.
 * Elements with data-phase attribute matching the phaseId stay visible; others get opacity 0.
 */
function applyPhaseToSvg(svgEl: SVGSVGElement, phaseId: string): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  // Find all phase-wrap groups and set visibility
  const wraps = clone.querySelectorAll('[data-phase-wrap]');
  wraps.forEach(g => {
    const elPhase = (g as HTMLElement).getAttribute('data-phase-wrap');
    if (elPhase && elPhase !== phaseId && elPhase !== 'global') {
      (g as HTMLElement).style.opacity = '0';
    } else {
      (g as HTMLElement).style.opacity = '1';
    }
  });
  return clone;
}

/**
 * Export each timeline phase as a separate PNG blob.
 */
export async function exportTimelineAsPngSeries(
  svgEl: SVGSVGElement,
  phases: TimelinePhase[],
  width = 1920,
  height = 1080,
): Promise<{ name: string; blob: Blob }[]> {
  const results: { name: string; blob: Blob }[] = [];

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];
    const phasedSvg = applyPhaseToSvg(svgEl, phase.id);
    const canvas = await renderSvgToCanvas(phasedSvg, width, height);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob(b => resolve(b!), 'image/png')
    );
    results.push({
      name: `phase-${i + 1}-${phase.label.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')}.png`,
      blob,
    });
  }

  return results;
}

/**
 * Export timeline as animated GIF using modern-gif.
 */
export async function exportTimelineAsGif(
  svgEl: SVGSVGElement,
  phases: TimelinePhase[],
  frameDelayMs = 2000,
  width = 960,
  height = 540,
): Promise<Blob> {
  const { encode } = await import('modern-gif');

  const frames: { imageData: ImageData; delay: number }[] = [];

  for (const phase of phases) {
    const phasedSvg = applyPhaseToSvg(svgEl, phase.id);
    const canvas = await renderSvgToCanvas(phasedSvg, width, height);
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, width, height);
    frames.push({ imageData, delay: frameDelayMs });
  }

  const output = await encode({
    width,
    height,
    frames: frames.map(f => ({
      data: f.imageData.data,
      delay: f.delay,
    })),
  });

  return new Blob([output], { type: 'image/gif' });
}

/**
 * Download a blob as a file.
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download all PNG series as individual files.
 */
export async function downloadPngSeries(
  svgEl: SVGSVGElement,
  phases: TimelinePhase[],
  width = 1920,
  height = 1080,
) {
  const files = await exportTimelineAsPngSeries(svgEl, phases, width, height);
  for (const file of files) {
    downloadBlob(file.blob, file.name);
    // Small delay between downloads to avoid browser blocking
    await new Promise(r => setTimeout(r, 200));
  }
}
