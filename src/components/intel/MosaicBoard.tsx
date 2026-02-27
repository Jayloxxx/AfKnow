import { useState } from 'react';
import { ChevronRight, Trash2, Edit3, Users, FileText, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useIntelStore } from '../../store/useIntelStore';
import { CATEGORY_CONFIG, SEVERITY_CONFIG, TREND_CONFIG, VERIFICATION_CONFIG } from '../../types/intel';
import type { MosaicEvent, IntelReport } from '../../types/intel';

export default function MosaicBoard() {
  const { events, reports, actors, intelEventLinks, actorEventLinks, removeEvent, setEditingEvent, setShowEventForm } = useIntelStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getLinkedReports = (eventId: string): IntelReport[] => {
    const reportIds = intelEventLinks.filter(l => l.mosaicEventId === eventId).map(l => l.intelReportId);
    return reports.filter(r => reportIds.includes(r.id));
  };

  const getLinkedActors = (eventId: string) => {
    const links = actorEventLinks.filter(l => l.mosaicEventId === eventId);
    return links.map(l => {
      const actor = actors.find(a => a.id === l.actorId);
      return actor ? { ...actor, role: l.role } : null;
    }).filter(Boolean);
  };

  // Group by status
  const activeEvents = events.filter(e => e.status === 'active');
  const monitoringEvents = events.filter(e => e.status === 'monitoring');
  const resolvedEvents = events.filter(e => e.status === 'resolved' || e.status === 'archived');

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'escalating') return <TrendingUp size={12} style={{ color: '#ef4444' }} />;
    if (trend === 'de-escalating') return <TrendingDown size={12} style={{ color: '#22c55e' }} />;
    return <Minus size={12} style={{ color: '#eab308' }} />;
  };

  const renderEventCard = (event: MosaicEvent) => {
    const cat = CATEGORY_CONFIG[event.category] ?? CATEGORY_CONFIG.other;
    const sev = SEVERITY_CONFIG[event.severity] ?? SEVERITY_CONFIG[3];
    const trend = TREND_CONFIG[event.trend] ?? TREND_CONFIG.stable;
    const linkedReports = getLinkedReports(event.id);
    const linkedActors = getLinkedActors(event.id);
    const isExpanded = expandedId === event.id;

    return (
      <div key={event.id} className="bg-card border border-theme rounded-lg overflow-hidden transition-all hover:border-opacity-60 anim-fade-up">
        {/* Card Header */}
        <div
          className="p-3 cursor-pointer"
          onClick={() => setExpandedId(isExpanded ? null : event.id)}
          style={{ borderLeft: `3px solid ${sev.color}` }}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: cat.color + '20', color: cat.color }}>
                  {cat.label}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: sev.color + '20', color: sev.color }}>
                  SEV {event.severity}
                </span>
                <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: trend.color + '20', color: trend.color }}>
                  <TrendIcon trend={event.trend} />
                  {trend.label}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-main">{event.title}</h3>
              {event.region && <span className="text-[10px] text-muted">{event.region}</span>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 text-[10px] text-muted">
                <FileText size={11} /> {linkedReports.length}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted">
                <Users size={11} /> {linkedActors.length}
              </div>
              <ChevronRight size={14} className={`text-muted transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </div>

        {/* Expanded Detail */}
        {isExpanded && (
          <div className="border-t border-theme p-3 space-y-3 bg-surface">
            {event.description && (
              <p className="text-[11px] text-muted leading-relaxed">{event.description}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => { setEditingEvent(event); setShowEventForm(true); }}
                className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-card border border-theme text-muted hover:text-main transition-colors">
                <Edit3 size={11} /> Bearbeiten
              </button>
              <button onClick={() => { if (confirm('Event löschen?')) removeEvent(event.id); }}
                className="flex items-center gap-1 px-2 py-1 text-[10px] rounded bg-card border border-theme text-muted hover:text-red-400 transition-colors">
                <Trash2 size={11} /> Löschen
              </button>
            </div>

            {/* Linked Reports */}
            {linkedReports.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Verknüpfte Reports ({linkedReports.length})</h4>
                <div className="space-y-1">
                  {linkedReports.map(r => {
                    const verif = VERIFICATION_CONFIG[r.verificationStatus];
                    return (
                      <div key={r.id} className="flex items-center gap-2 px-2 py-1 rounded bg-card text-[11px]">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: verif.color }} />
                        <span className="text-main truncate flex-1">{r.title}</span>
                        <span className="text-[9px] text-muted">{new Date(r.createdAt).toLocaleDateString('de-DE')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Linked Actors */}
            {linkedActors.length > 0 && (
              <div>
                <h4 className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Akteure ({linkedActors.length})</h4>
                <div className="flex flex-wrap gap-1.5">
                  {linkedActors.map((a: any) => (
                    <span key={a.id} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-card border border-theme text-main">
                      {a.name}
                      {a.role && <span className="text-muted">({a.role})</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {event.tags.map(t => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-hover text-muted">#{t}</span>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="text-[10px] text-muted">
              Erstellt: {new Date(event.createdAt).toLocaleDateString('de-DE')}
              {event.startedAt && ` | Beginn: ${new Date(event.startedAt).toLocaleDateString('de-DE')}`}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, eventList: MosaicEvent[], color: string) => {
    if (eventList.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color }}>
          {title} ({eventList.length})
        </h3>
        <div className="space-y-2">
          {eventList.map(renderEventCard)}
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 overflow-y-auto p-4 bg-main">
      {events.length === 0 ? (
        <div className="text-center text-muted text-sm py-12">
          Noch keine Mosaik-Events. Erstelle das erste Event!
        </div>
      ) : (
        <>
          {renderSection('Aktiv', activeEvents, '#ef4444')}
          {renderSection('Monitoring', monitoringEvents, '#eab308')}
          {renderSection('Abgeschlossen', resolvedEvents, '#6b7280')}
        </>
      )}
    </div>
  );
}
