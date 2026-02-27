import { useState, useCallback, useRef, useMemo } from 'react';

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 100000; // Supports OSM z=19 street-level detail
const BASE_W = 1000;
const BASE_H = 1100;

export function useCanvasTransform() {
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  const viewBox = useMemo(() => {
    const w = BASE_W / zoom;
    const h = BASE_H / zoom;
    return `${panX} ${panY} ${w} ${h}`;
  }, [zoom, panX, panY]);

  // Convert screen pixel coordinates to SVG viewBox coordinates
  const screenToSvg = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM()?.inverse();
    if (!ctm) return { x: 0, y: 0 };
    const svgPt = pt.matrixTransform(ctm);
    return { x: svgPt.x, y: svgPt.y };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    // Progressive zoom: faster scroll when zoomed in deep
    const speed = 0.12 + 0.08 * Math.min(8, Math.log2(Math.max(1, zoom)));
    const factor = e.deltaY < 0 ? (1 + speed) : 1 / (1 + speed);
    setZoom((z) => {
      const newZ = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * factor));
      // Zoom toward cursor position
      const svg = svgRef.current;
      if (svg) {
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const ctm = svg.getScreenCTM()?.inverse();
        if (ctm) {
          const svgPt = pt.matrixTransform(ctm);
          const newW = BASE_W / newZ;
          const newH = BASE_H / newZ;
          const oldW = BASE_W / z;
          const oldH = BASE_H / z;
          // Adjust pan so cursor stays on same SVG point
          const frac = { x: (svgPt.x - panX) / oldW, y: (svgPt.y - panY) / oldH };
          setPanX(svgPt.x - frac.x * newW);
          setPanY(svgPt.y - frac.y * newH);
        }
      }
      return newZ;
    });
  }, [panX, panY]);

  const startPan = useCallback((clientX: number, clientY: number) => {
    isPanning.current = true;
    panStart.current = { x: clientX, y: clientY, px: panX, py: panY };
  }, [panX, panY]);

  const movePan = useCallback((clientX: number, clientY: number) => {
    if (!isPanning.current) return false;
    const svg = svgRef.current;
    if (!svg) return false;
    const rect = svg.getBoundingClientRect();
    const scaleX = (BASE_W / zoom) / rect.width;
    const scaleY = (BASE_H / zoom) / rect.height;
    setPanX(panStart.current.px - (clientX - panStart.current.x) * scaleX);
    setPanY(panStart.current.py - (clientY - panStart.current.y) * scaleY);
    return true;
  }, [zoom]);

  const endPan = useCallback(() => {
    isPanning.current = false;
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((z) => {
      const speed = 0.3 + 0.2 * Math.min(8, Math.log2(Math.max(1, z)));
      return Math.min(MAX_ZOOM, z * (1 + speed));
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const speed = 0.3 + 0.2 * Math.min(8, Math.log2(Math.max(1, z)));
      return Math.max(MIN_ZOOM, z / (1 + speed));
    });
  }, []);

  /** Fit view to a bounding box with padding */
  const fitToContent = useCallback((bbox: { minX: number; minY: number; maxX: number; maxY: number }, animate = true) => {
    const bw = bbox.maxX - bbox.minX;
    const bh = bbox.maxY - bbox.minY;
    if (bw <= 0 || bh <= 0) return;

    const padding = 0.15; // 15% padding on each side
    const paddedW = bw * (1 + padding * 2);
    const paddedH = bh * (1 + padding * 2);
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(BASE_W / paddedW, BASE_H / paddedH)));
    const centerX = bbox.minX + bw / 2;
    const centerY = bbox.minY + bh / 2;

    if (animate) {
      // Use animateTo for smooth transition
      const startTime = performance.now();
      const dur = 500;
      const sZ = zoom, sPX = panX, sPY = panY;
      const tPX = centerX - (BASE_W / newZoom) / 2;
      const tPY = centerY - (BASE_H / newZoom) / 2;
      function step(now: number) {
        const t = Math.min(1, (now - startTime) / dur);
        const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
        const cZ = sZ + (newZoom - sZ) * ease;
        setZoom(cZ);
        setPanX(sPX + (tPX - sPX) * ease);
        setPanY(sPY + (tPY - sPY) * ease);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    } else {
      setZoom(newZoom);
      setPanX(centerX - (BASE_W / newZoom) / 2);
      setPanY(centerY - (BASE_H / newZoom) / 2);
    }
  }, [zoom, panX, panY]);

  /** Smooth animated pan+zoom to a target SVG coordinate */
  const animateTo = useCallback((targetX: number, targetY: number, targetZoom: number, duration = 400) => {
    const startTime = performance.now();
    const startZoom = zoom;
    const startPanX = panX;
    const startPanY = panY;

    function step(now: number) {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; // easeInOutQuad

      const curZoom = startZoom + (targetZoom - startZoom) * ease;
      const vw = BASE_W / curZoom;
      const vh = BASE_H / curZoom;
      const targetPanX = targetX - vw / 2;
      const targetPanY = targetY - vh / 2;
      const curPanX = startPanX + (targetPanX - startPanX) * ease;
      const curPanY = startPanY + (targetPanY - startPanY) * ease;

      setZoom(curZoom);
      setPanX(curPanX);
      setPanY(curPanY);

      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [zoom, panX, panY]);

  return {
    zoom, panX, panY, viewBox, svgRef,
    screenToSvg,
    handleWheel,
    startPan, movePan, endPan, isPanning,
    resetView, zoomIn, zoomOut,
    setZoom, setPanX, setPanY,
    fitToContent, animateTo,
  };
}

export type CanvasTransformState = ReturnType<typeof useCanvasTransform>;
