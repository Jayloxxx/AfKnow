import { useState, useMemo } from 'react';
import { Search, ExternalLink, MapPin, Clock, Trash2, Edit3, Link } from 'lucide-react';
import { useIntelStore } from '../../store/useIntelStore';
import { useStore } from '../../store/useStore';
import { useRegion } from '../../context/RegionContext';
import { VERIFICATION_CONFIG, CATEGORY_CONFIG, SEVERITY_CONFIG, SOURCE_TYPES } from '../../types/intel';
import type { IntelReport, IntelCategory, VerificationStatus, Severity } from '../../types/intel';

export default function IntelFeed() {
  const { reports, events, intelEventLinks, removeReport, setEditingReport, setShowReportForm, linkReportToEvent, unlinkReportFromEvent } = useIntelStore();
  const { user } = useStore();
  const region = useRegion();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<IntelCategory | ''>('');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 0>(0);
  const [filterVerification, setFilterVerification] = useState<VerificationStatus | ''>('');
  const [linkingReportId, setLinkingReportId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return reports.filter(r => {
      if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.content.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterCategory && r.category !== filterCategory) return false;
      if (filterSeverity && r.severity !== filterSeverity) return false;
      if (filterVerification && r.verificationStatus !== filterVerification) return false;
      return true;
    });
  }, [reports, search, filterCategory, filterSeverity, filterVerification]);

  const getLinkedEvents = (reportId: string) => {
    const eventIds = intelEventLinks.filter(l => l.intelReportId === reportId).map(l => l.mosaicEventId);
    return events.filter(e => eventIds.includes(e.id));
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Filters */}
      <div className="px-4 py-2 border-b border-theme flex items-center gap-2 flex-wrap shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="pl-8 pr-3 py-1.5 text-[11px] rounded-lg bg-card border border-theme text-main focus:outline-none"
            style={{ width: 200 }}
          />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as IntelCategory | '')}
          className="px-2 py-1.5 text-[11px] rounded-lg bg-card border border-theme text-main">
          <option value="">Alle Kategorien</option>
          {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterSeverity} onChange={e => setFilterSeverity(Number(e.target.value) as Severity | 0)}
          className="px-2 py-1.5 text-[11px] rounded-lg bg-card border border-theme text-main">
          <option value={0}>Alle Severity</option>
          {([5, 4, 3, 2, 1] as Severity[]).map(s => <option key={s} value={s}>{SEVERITY_CONFIG[s].label} ({s})</option>)}
        </select>
        <select value={filterVerification} onChange={e => setFilterVerification(e.target.value as VerificationStatus | '')}
          className="px-2 py-1.5 text-[11px] rounded-lg bg-card border border-theme text-main">
          <option value="">Alle Status</option>
          {Object.entries(VERIFICATION_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="text-[10px] text-muted ml-auto">{filtered.length} Reports</span>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center text-muted text-sm py-12">
            {reports.length === 0 ? 'Noch keine Intel-Reports. Erstelle den ersten!' : 'Keine Treffer für die aktiven Filter.'}
          </div>
        ) : filtered.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            region={region}
            linkedEvents={getLinkedEvents(report.id)}
            isLinking={linkingReportId === report.id}
            allEvents={events}
            onEdit={() => { setEditingReport(report); setShowReportForm(true); }}
            onDelete={() => { if (confirm('Report löschen?')) removeReport(report.id); }}
            onStartLink={() => setLinkingReportId(linkingReportId === report.id ? null : report.id)}
            onLinkToEvent={(eventId) => {
              if (user) linkReportToEvent(user.id, report.id, eventId);
              setLinkingReportId(null);
            }}
            onUnlink={(linkId) => unlinkReportFromEvent(linkId)}
            intelEventLinks={intelEventLinks}
          />
        ))}
      </div>
    </div>
  );
}

function ReportCard({ report, region, linkedEvents, isLinking, allEvents, onEdit, onDelete, onStartLink, onLinkToEvent, onUnlink, intelEventLinks }: {
  report: IntelReport;
  region: any;
  linkedEvents: any[];
  isLinking: boolean;
  allEvents: any[];
  onEdit: () => void;
  onDelete: () => void;
  onStartLink: () => void;
  onLinkToEvent: (eventId: string) => void;
  onUnlink: (linkId: string) => void;
  intelEventLinks: any[];
}) {
  const verif = VERIFICATION_CONFIG[report.verificationStatus] ?? VERIFICATION_CONFIG.unconfirmed;
  const cat = CATEGORY_CONFIG[report.category] ?? CATEGORY_CONFIG.other;
  const sev = SEVERITY_CONFIG[report.severity] ?? SEVERITY_CONFIG[3];
  const sourceLabel = SOURCE_TYPES.find(s => s.value === report.sourceType)?.label ?? report.sourceType;
  const linkedEventIds = new Set(linkedEvents.map(e => e.id));
  const availableEvents = allEvents.filter(e => !linkedEventIds.has(e.id));

  return (
    <div className="bg-card border border-theme rounded-lg p-3 hover:border-opacity-60 transition-all anim-fade-up"
      style={{ borderLeftWidth: 3, borderLeftColor: sev.color }}>
      {/* Header */}
      <div className="flex items-start gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: cat.color + '20', color: cat.color }}>
              {cat.label}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: verif.bg, color: verif.color }}>
              {verif.label}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: sev.color + '20', color: sev.color }}>
              SEV {report.severity}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-main truncate">{report.title}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onStartLink} className="p-1 rounded hover:bg-hover text-muted hover:text-main transition-colors" title="Mit Event verknüpfen">
            <Link size={13} />
          </button>
          <button onClick={onEdit} className="p-1 rounded hover:bg-hover text-muted hover:text-main transition-colors" title="Bearbeiten">
            <Edit3 size={13} />
          </button>
          <button onClick={onDelete} className="p-1 rounded hover:bg-hover text-muted hover:text-red-400 transition-colors" title="Löschen">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="text-[11px] text-muted leading-relaxed mb-2 line-clamp-3">{report.content}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[10px] text-muted flex-wrap">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {new Date(report.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </span>
        <span>{sourceLabel}{report.sourceName ? ` — ${report.sourceName}` : ''}</span>
        {report.locationLabel && (
          <span className="flex items-center gap-1"><MapPin size={10} />{report.locationLabel}</span>
        )}
        {report.sourceUrl && (
          <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-main">
            <ExternalLink size={10} />Quelle
          </a>
        )}
        {report.tags.length > 0 && report.tags.map(t => (
          <span key={t} className="px-1.5 py-0.5 rounded bg-hover text-[9px]">#{t}</span>
        ))}
      </div>

      {/* Linked Events */}
      {linkedEvents.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-muted">Events:</span>
          {linkedEvents.map(ev => {
            const link = intelEventLinks.find(l => l.intelReportId === report.id && l.mosaicEventId === ev.id);
            return (
              <span key={ev.id} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                style={{ background: `color-mix(in srgb, ${region.accentHex} 12%, transparent)`, color: region.accentHex }}>
                {ev.title}
                {link && (
                  <button onClick={() => onUnlink(link.id)} className="hover:text-red-400 ml-0.5">&times;</button>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Link Dropdown */}
      {isLinking && availableEvents.length > 0 && (
        <div className="mt-2 p-2 bg-hover rounded-lg border border-theme">
          <p className="text-[10px] text-muted mb-1.5">Mit Event verknüpfen:</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {availableEvents.map(ev => (
              <button key={ev.id} onClick={() => onLinkToEvent(ev.id)}
                className="w-full text-left px-2 py-1 text-[11px] rounded hover:bg-card text-main transition-colors">
                {ev.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analyst Notes */}
      {report.analystNotes && (
        <div className="mt-2 px-2 py-1.5 rounded bg-hover border-l-2 text-[11px] text-muted italic"
          style={{ borderLeftColor: region.accentHex }}>
          {report.analystNotes}
        </div>
      )}
    </div>
  );
}
