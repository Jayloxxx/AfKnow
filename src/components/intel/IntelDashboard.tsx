import { useEffect } from 'react';
import { Radar, List, LayoutGrid, FileText, Users, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useIntelStore } from '../../store/useIntelStore';
import { useRegion } from '../../context/RegionContext';
import IntelFeed from './IntelFeed';
import MosaicBoard from './MosaicBoard';
import BriefingList from './BriefingList';
import ActorList from './ActorList';
import IntelReportForm from './IntelReportForm';
import MosaicEventForm from './MosaicEventForm';

const SUB_TABS = [
  { id: 'feed' as const, label: 'Intel Feed', icon: List },
  { id: 'mosaic' as const, label: 'Mosaik', icon: LayoutGrid },
  { id: 'briefings' as const, label: 'Briefings', icon: FileText },
  { id: 'actors' as const, label: 'Akteure', icon: Users },
] as const;

export default function IntelDashboard() {
  const { user } = useStore();
  const region = useRegion();
  const { intelTab, setIntelTab, loadAll, loading, showReportForm, setShowReportForm, showEventForm, setShowEventForm, setEditingReport, setEditingEvent, reports, events } = useIntelStore();

  useEffect(() => {
    if (user) loadAll(user.id).catch(console.error);
  }, [user?.id]);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted">
        <div className="text-center space-y-3">
          <Radar size={48} className="mx-auto opacity-30" />
          <p className="text-lg font-medium">MOSAIC Intel Engine</p>
          <p className="text-sm">Bitte anmelden um das Intel-System zu nutzen.</p>
        </div>
      </div>
    );
  }

  // Stats
  const severity45 = reports.filter(r => r.severity >= 4).length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const escalating = events.filter(e => e.trend === 'escalating').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 bg-surface border-b border-theme flex items-center px-4 gap-3 shrink-0">
        <Radar size={18} style={{ color: region.accentHex }} />
        <span className="font-display font-semibold text-sm text-main">MOSAIC Intel</span>

        {/* Stats */}
        <div className="flex items-center gap-3 ml-4 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-card border border-theme text-muted">
            {reports.length} Reports
          </span>
          {severity45 > 0 && (
            <span className="px-2 py-0.5 rounded text-white" style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.4)' }}>
              {severity45} Kritisch
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-card border border-theme text-muted">
            {activeEvents} aktive Events
          </span>
          {escalating > 0 && (
            <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(249,115,22,0.2)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316' }}>
              {escalating} eskalierend
            </span>
          )}
        </div>

        <div className="flex-1" />

        {/* Sub-Tab Navigation */}
        <nav className="flex items-center gap-0.5 bg-card rounded-lg p-0.5 border border-theme">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = intelTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setIntelTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  active ? 'shadow-sm' : 'text-muted hover:text-main hover:bg-hover'
                }`}
                style={active ? {
                  background: `color-mix(in srgb, ${region.accentHex} 15%, transparent)`,
                  color: region.accentHex,
                } : undefined}
              >
                <Icon size={13} />
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Add Button */}
        <button
          onClick={() => {
            if (intelTab === 'mosaic') {
              setEditingEvent(null);
              setShowEventForm(true);
            } else {
              setEditingReport(null);
              setShowReportForm(true);
            }
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
          style={{
            background: `color-mix(in srgb, ${region.accentHex} 15%, transparent)`,
            border: `1px solid color-mix(in srgb, ${region.accentHex} 30%, transparent)`,
            color: region.accentHex,
          }}
        >
          <Plus size={13} />
          {intelTab === 'mosaic' ? 'Event' : intelTab === 'actors' ? 'Akteur' : 'Report'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-main">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted text-sm">Laden...</div>
        ) : (
          <>
            {intelTab === 'feed' && <IntelFeed />}
            {intelTab === 'mosaic' && <MosaicBoard />}
            {intelTab === 'briefings' && <BriefingList />}
            {intelTab === 'actors' && <ActorList />}
          </>
        )}
      </div>

      {/* Modals */}
      {showReportForm && <IntelReportForm onClose={() => setShowReportForm(false)} />}
      {showEventForm && <MosaicEventForm onClose={() => setShowEventForm(false)} />}
    </div>
  );
}
