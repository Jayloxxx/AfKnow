import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Filter } from 'lucide-react';
import { useRegion } from '../../context/RegionContext';
import {
  getEntriesForRegion, KB_CATEGORY_CONFIG,
  type KBCategory,
} from '../../data/knowledgeBase';
import { useKnowledgeStore } from '../../store/useKnowledgeStore';

interface GraphNode {
  id: string;
  label: string;
  category: KBCategory;
  severity: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx: number | null;
  fy: number | null;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  color: string;
}

const RELATION_COLORS: Record<string, string> = {
  related: '#6b7280', cause: '#f59e0b', effect: '#3b82f6', 'actor-in': '#8b5cf6',
  'part-of': '#06b6d4', successor: '#22c55e', predecessor: '#f97316', opposed: '#ef4444', allied: '#10b981',
};

const RELATION_LABELS: Record<string, string> = {
  related: 'Verwandt', cause: 'Ursache', effect: 'Folge', 'actor-in': 'Akteur in',
  'part-of': 'Teil von', successor: 'Nachfolger', predecessor: 'Vorgänger', opposed: 'Gegner', allied: 'Verbündet',
};

export default function NetworkGraph() {
  const region = useRegion();
  const store = useKnowledgeStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<KBCategory | 'all'>('all');
  const [filterRelation, setFilterRelation] = useState<string | 'all'>('all');

  const entries = useMemo(() => getEntriesForRegion(region.id), [region.id]);

  // Build graph data
  const { nodes, edges } = useMemo(() => {
    const entryMap = new Map(entries.map(e => [e.id, e]));
    const filteredEntries = filterCategory === 'all' ? entries : entries.filter(e => e.category === filterCategory);
    const nodeIds = new Set(filteredEntries.map(e => e.id));

    // Also include linked entries that are targets
    for (const e of filteredEntries) {
      for (const link of e.crossLinks) {
        if (entryMap.has(link.targetId)) {
          nodeIds.add(link.targetId);
        }
      }
    }

    const w = 800;
    const h = 600;
    const nodeArr: GraphNode[] = [];
    const idxMap = new Map<string, number>();

    let idx = 0;
    for (const id of nodeIds) {
      const entry = entryMap.get(id);
      if (!entry) continue;
      const angle = (idx / nodeIds.size) * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      nodeArr.push({
        id: entry.id,
        label: entry.title,
        category: entry.category,
        severity: entry.severity,
        x: w / 2 + Math.cos(angle) * radius,
        y: h / 2 + Math.sin(angle) * radius,
        vx: 0, vy: 0,
        fx: null, fy: null,
      });
      idxMap.set(entry.id, idx);
      idx++;
    }

    const edgeArr: GraphEdge[] = [];
    for (const e of entries) {
      if (!nodeIds.has(e.id)) continue;
      for (const link of e.crossLinks) {
        if (!nodeIds.has(link.targetId)) continue;
        if (filterRelation !== 'all' && link.relationship !== filterRelation) continue;
        edgeArr.push({
          source: e.id,
          target: link.targetId,
          relationship: link.relationship,
          color: RELATION_COLORS[link.relationship] ?? '#6b7280',
        });
      }
    }

    return { nodes: nodeArr, edges: edgeArr };
  }, [entries, filterCategory, filterRelation]);

  // Force simulation
  const nodesRef = useRef<GraphNode[]>([]);

  useEffect(() => {
    // Reset positions when graph changes
    nodesRef.current = nodes.map(n => ({ ...n }));
  }, [nodes]);

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    let running = true;
    let alpha = 1;

    const tick = () => {
      if (!running || alpha < 0.001) return;

      const ns = nodesRef.current;
      const strength = 0.02;
      const repulsion = 2000;
      const linkDist = 120;

      // Reset forces
      for (const n of ns) {
        n.vx = 0;
        n.vy = 0;
      }

      // Center gravity
      for (const n of ns) {
        n.vx += (400 - n.x) * strength * 0.5;
        n.vy += (300 - n.y) * strength * 0.5;
      }

      // Repulsion between all nodes
      for (let i = 0; i < ns.length; i++) {
        for (let j = i + 1; j < ns.length; j++) {
          const dx = ns[j].x - ns[i].x;
          const dy = ns[j].y - ns[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          ns[i].vx -= fx;
          ns[i].vy -= fy;
          ns[j].vx += fx;
          ns[j].vy += fy;
        }
      }

      // Link attraction
      const nodeMap = new Map(ns.map(n => [n.id, n]));
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - linkDist) * strength;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        s.vx += fx;
        s.vy += fy;
        t.vx -= fx;
        t.vy -= fy;
      }

      // Apply velocities with damping
      for (const n of ns) {
        if (n.fx !== null) { n.x = n.fx; n.vx = 0; }
        else { n.vx *= 0.6; n.x += n.vx * alpha; }
        if (n.fy !== null) { n.y = n.fy; n.vy = 0; }
        else { n.vy *= 0.6; n.y += n.vy * alpha; }
        // Clamp
        n.x = Math.max(50, Math.min(750, n.x));
        n.y = Math.max(50, Math.min(550, n.y));
      }

      alpha *= 0.995;
      forceUpdate(v => v + 1);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(animRef.current); };
  }, [edges]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDragging(nodeId);
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (node) {
      node.fx = node.x;
      node.fy = node.y;
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const node = nodesRef.current.find(n => n.id === dragging);
      if (node && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        node.fx = (e.clientX - rect.left - pan.x) / zoom;
        node.fy = (e.clientY - rect.top - pan.y) / zoom;
        node.x = node.fx;
        node.y = node.fy;
        forceUpdate(v => v + 1);
      }
    } else if (panning) {
      setPan({
        x: pan.x + (e.clientX - panStart.x),
        y: pan.y + (e.clientY - panStart.y),
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [dragging, panning, pan, panStart, zoom]);

  const handleMouseUp = useCallback(() => {
    if (dragging) {
      const node = nodesRef.current.find(n => n.id === dragging);
      if (node) { node.fx = null; node.fy = null; }
      setDragging(null);
    }
    setPanning(false);
  }, [dragging]);

  const handleBgMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === 'rect') {
      setPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)));
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    store.selectEntry(nodeId);
    store.setViewMode('entries');
  }, [store]);

  const displayNodes = nodesRef.current.length > 0 ? nodesRef.current : nodes;
  const nodeMap = new Map(displayNodes.map(n => [n.id, n]));

  // Find connected edges for hovered node
  const hoveredEdges = hoveredNode
    ? new Set(edges.filter(e => e.source === hoveredNode || e.target === hoveredNode).map(e => `${e.source}-${e.target}`))
    : null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-main">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-theme bg-surface">
        <h2 className="font-display font-bold text-sm text-main mr-3">Netzwerk-Graph</h2>

        {/* Category filter */}
        <div className="flex items-center gap-1">
          <Filter size={11} className="text-muted" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as KBCategory | 'all')}
            className="text-[10px] bg-card border border-theme rounded px-1.5 py-1 text-main"
          >
            <option value="all">Alle Kategorien</option>
            {(Object.keys(KB_CATEGORY_CONFIG) as KBCategory[]).map(cat => (
              <option key={cat} value={cat}>{KB_CATEGORY_CONFIG[cat].label}</option>
            ))}
          </select>
        </div>

        {/* Relation filter */}
        <select
          value={filterRelation}
          onChange={e => setFilterRelation(e.target.value)}
          className="text-[10px] bg-card border border-theme rounded px-1.5 py-1 text-main"
        >
          <option value="all">Alle Beziehungen</option>
          {Object.entries(RELATION_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <div className="flex-1" />

        {/* Zoom controls */}
        <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="w-7 h-7 rounded bg-card border border-theme flex items-center justify-center text-muted hover:text-main">
          <ZoomIn size={13} />
        </button>
        <span className="text-[10px] font-mono text-muted w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="w-7 h-7 rounded bg-card border border-theme flex items-center justify-center text-muted hover:text-main">
          <ZoomOut size={13} />
        </button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="w-7 h-7 rounded bg-card border border-theme flex items-center justify-center text-muted hover:text-main">
          <Maximize2 size={13} />
        </button>

        <div className="text-[10px] text-muted font-mono ml-2">
          {displayNodes.length} Knoten · {edges.length} Kanten
        </div>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing">
        <svg
          ref={svgRef}
          className="w-full h-full"
          onMouseDown={handleBgMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <rect width="100%" height="100%" fill="transparent" />
          <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`}>
            {/* Edges */}
            {edges.map((edge, i) => {
              const s = nodeMap.get(edge.source);
              const t = nodeMap.get(edge.target);
              if (!s || !t) return null;
              const dimmed = hoveredEdges && !hoveredEdges.has(`${edge.source}-${edge.target}`);
              const isOpposed = edge.relationship === 'opposed';
              return (
                <line
                  key={`${edge.source}-${edge.target}-${i}`}
                  x1={s.x} y1={s.y}
                  x2={t.x} y2={t.y}
                  stroke={edge.color}
                  strokeWidth={hoveredEdges && !dimmed ? 2 : 1}
                  strokeOpacity={dimmed ? 0.1 : 0.5}
                  strokeDasharray={isOpposed ? '6,4' : undefined}
                />
              );
            })}

            {/* Edge labels on hover */}
            {hoveredNode && edges.filter(e => e.source === hoveredNode || e.target === hoveredNode).map((edge, i) => {
              const s = nodeMap.get(edge.source);
              const t = nodeMap.get(edge.target);
              if (!s || !t) return null;
              return (
                <text
                  key={`label-${i}`}
                  x={(s.x + t.x) / 2}
                  y={(s.y + t.y) / 2 - 6}
                  textAnchor="middle"
                  fill={edge.color}
                  fontSize={8}
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  {RELATION_LABELS[edge.relationship] ?? edge.relationship}
                </text>
              );
            })}

            {/* Nodes */}
            {displayNodes.map((node) => {
              const catCfg = KB_CATEGORY_CONFIG[node.category];
              const r = 10 + node.severity * 4;
              const isHovered = hoveredNode === node.id;
              const dimmed = hoveredNode && hoveredNode !== node.id &&
                !edges.some(e => (e.source === hoveredNode && e.target === node.id) || (e.target === hoveredNode && e.source === node.id));

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onDoubleClick={() => handleNodeClick(node.id)}
                  style={{ cursor: 'pointer' }}
                  opacity={dimmed ? 0.2 : 1}
                >
                  {/* Glow */}
                  {isHovered && (
                    <circle r={r + 6} fill={catCfg.color} opacity={0.15} />
                  )}
                  {/* Main circle */}
                  <circle
                    r={r}
                    fill={`color-mix(in srgb, ${catCfg.color} 20%, var(--card))`}
                    stroke={catCfg.color}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                  />
                  {/* Severity indicator */}
                  <circle r={3} fill={catCfg.color} />
                  {/* Label */}
                  <text
                    y={r + 12}
                    textAnchor="middle"
                    fill="var(--text-main)"
                    fontSize={isHovered ? 10 : 8}
                    fontFamily="var(--font-display)"
                    fontWeight={isHovered ? '700' : '500'}
                  >
                    {node.label.length > 22 ? node.label.slice(0, 20) + '…' : node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-surface/90 backdrop-blur-sm border border-theme text-[9px]">
          <div className="font-bold text-muted uppercase tracking-wider mb-1.5">Legende</div>
          <div className="space-y-1">
            {(Object.keys(KB_CATEGORY_CONFIG) as KBCategory[]).map(cat => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border" style={{ borderColor: KB_CATEGORY_CONFIG[cat].color, background: `color-mix(in srgb, ${KB_CATEGORY_CONFIG[cat].color} 20%, transparent)` }} />
                <span className="text-muted">{KB_CATEGORY_CONFIG[cat].label}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-theme/50 mt-1.5 pt-1.5 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px bg-gray-400" />
              <span className="text-muted">Verbindung</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-px border-t border-dashed border-red-400" />
              <span className="text-muted">Gegnerschaft</span>
            </div>
          </div>
          <div className="border-t border-theme/50 mt-1.5 pt-1.5 text-muted">
            Doppelklick → Eintrag öffnen
          </div>
        </div>

        {/* Hovered info */}
        {hoveredNode && (() => {
          const node = nodeMap.get(hoveredNode);
          if (!node) return null;
          const connectedEdges = edges.filter(e => e.source === hoveredNode || e.target === hoveredNode);
          return (
            <div className="absolute top-3 right-3 p-3 rounded-xl bg-surface/95 backdrop-blur-sm border border-theme w-56">
              <div className="font-display font-bold text-xs text-main mb-1">{node.label}</div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: KB_CATEGORY_CONFIG[node.category].color }} />
                <span className="text-[10px] text-muted">{KB_CATEGORY_CONFIG[node.category].label}</span>
              </div>
              <div className="text-[9px] text-muted font-mono">{connectedEdges.length} Verbindungen</div>
              <div className="mt-1.5 space-y-0.5">
                {connectedEdges.slice(0, 5).map((e, i) => {
                  const otherId = e.source === hoveredNode ? e.target : e.source;
                  const other = nodeMap.get(otherId);
                  return (
                    <div key={i} className="flex items-center gap-1 text-[9px]">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
                      <span className="text-muted truncate">{RELATION_LABELS[e.relationship]}: {other?.label ?? otherId}</span>
                    </div>
                  );
                })}
                {connectedEdges.length > 5 && (
                  <div className="text-[9px] text-muted">+{connectedEdges.length - 5} weitere</div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
