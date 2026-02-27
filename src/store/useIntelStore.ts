import { create } from 'zustand';
import type { IntelReport, MosaicEvent, IntelActor, DailyBriefing, IntelEventLink, ActorEventLink } from '../types/intel';
import * as api from '../lib/intelApi';

interface IntelState {
  // Data
  reports: IntelReport[];
  events: MosaicEvent[];
  actors: IntelActor[];
  briefings: DailyBriefing[];
  intelEventLinks: IntelEventLink[];
  actorEventLinks: ActorEventLink[];
  loading: boolean;

  // UI state
  intelTab: 'feed' | 'mosaic' | 'briefings' | 'actors';
  setIntelTab: (tab: 'feed' | 'mosaic' | 'briefings' | 'actors') => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  showReportForm: boolean;
  setShowReportForm: (show: boolean) => void;
  showEventForm: boolean;
  setShowEventForm: (show: boolean) => void;
  editingReport: IntelReport | null;
  setEditingReport: (r: IntelReport | null) => void;
  editingEvent: MosaicEvent | null;
  setEditingEvent: (e: MosaicEvent | null) => void;

  // Actions
  loadAll: (userId: string) => Promise<void>;
  saveReport: (userId: string, report: Partial<IntelReport> & { id: string }) => Promise<void>;
  removeReport: (id: string) => Promise<void>;
  saveEvent: (userId: string, event: Partial<MosaicEvent> & { id: string }) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  saveActor: (userId: string, actor: Partial<IntelActor> & { id: string }) => Promise<void>;
  removeActor: (id: string) => Promise<void>;
  linkReportToEvent: (userId: string, reportId: string, eventId: string) => Promise<void>;
  unlinkReportFromEvent: (linkId: string) => Promise<void>;
  linkActorToEvent: (userId: string, actorId: string, eventId: string, role: string) => Promise<void>;
  unlinkActorFromEvent: (linkId: string) => Promise<void>;
  saveBriefing: (userId: string, briefing: Partial<DailyBriefing> & { id: string }) => Promise<void>;
  removeBriefing: (id: string) => Promise<void>;
}

export const useIntelStore = create<IntelState>()((set, get) => ({
  reports: [],
  events: [],
  actors: [],
  briefings: [],
  intelEventLinks: [],
  actorEventLinks: [],
  loading: false,

  intelTab: 'feed',
  setIntelTab: (tab) => set({ intelTab: tab }),
  selectedReportId: null,
  setSelectedReportId: (id) => set({ selectedReportId: id }),
  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  showReportForm: false,
  setShowReportForm: (show) => set({ showReportForm: show, editingReport: show ? get().editingReport : null }),
  showEventForm: false,
  setShowEventForm: (show) => set({ showEventForm: show, editingEvent: show ? get().editingEvent : null }),
  editingReport: null,
  setEditingReport: (r) => set({ editingReport: r }),
  editingEvent: null,
  setEditingEvent: (e) => set({ editingEvent: e }),

  loadAll: async (userId) => {
    set({ loading: true });
    try {
      const [reports, events, actors, briefings, intelEventLinks, actorEventLinks] = await Promise.all([
        api.fetchIntelReports(userId),
        api.fetchMosaicEvents(userId),
        api.fetchIntelActors(userId),
        api.fetchDailyBriefings(userId),
        api.fetchIntelEventLinks(userId),
        api.fetchActorEventLinks(userId),
      ]);
      set({ reports, events, actors, briefings, intelEventLinks, actorEventLinks, loading: false });
    } catch (e) {
      console.error('Intel loadAll failed:', e);
      set({ loading: false });
    }
  },

  saveReport: async (userId, report) => {
    await api.upsertIntelReport(userId, report);
    const reports = await api.fetchIntelReports(userId);
    set({ reports, showReportForm: false, editingReport: null });
  },

  removeReport: async (id) => {
    await api.deleteIntelReport(id);
    set((s) => ({
      reports: s.reports.filter((r) => r.id !== id),
      intelEventLinks: s.intelEventLinks.filter((l) => l.intelReportId !== id),
      selectedReportId: s.selectedReportId === id ? null : s.selectedReportId,
    }));
  },

  saveEvent: async (userId, event) => {
    await api.upsertMosaicEvent(userId, event);
    const events = await api.fetchMosaicEvents(userId);
    set({ events, showEventForm: false, editingEvent: null });
  },

  removeEvent: async (id) => {
    await api.deleteMosaicEvent(id);
    set((s) => ({
      events: s.events.filter((e) => e.id !== id),
      intelEventLinks: s.intelEventLinks.filter((l) => l.mosaicEventId !== id),
      actorEventLinks: s.actorEventLinks.filter((l) => l.mosaicEventId !== id),
      selectedEventId: s.selectedEventId === id ? null : s.selectedEventId,
    }));
  },

  saveActor: async (userId, actor) => {
    await api.upsertIntelActor(userId, actor);
    const actors = await api.fetchIntelActors(userId);
    set({ actors });
  },

  removeActor: async (id) => {
    await api.deleteIntelActor(id);
    set((s) => ({
      actors: s.actors.filter((a) => a.id !== id),
      actorEventLinks: s.actorEventLinks.filter((l) => l.actorId !== id),
    }));
  },

  linkReportToEvent: async (userId, reportId, eventId) => {
    await api.createIntelEventLink(userId, reportId, eventId);
    const intelEventLinks = await api.fetchIntelEventLinks(userId);
    set({ intelEventLinks });
  },

  unlinkReportFromEvent: async (linkId) => {
    await api.deleteIntelEventLink(linkId);
    set((s) => ({ intelEventLinks: s.intelEventLinks.filter((l) => l.id !== linkId) }));
  },

  linkActorToEvent: async (userId, actorId, eventId, role) => {
    await api.createActorEventLink(userId, actorId, eventId, role);
    const actorEventLinks = await api.fetchActorEventLinks(userId);
    set({ actorEventLinks });
  },

  unlinkActorFromEvent: async (linkId) => {
    await api.deleteActorEventLink(linkId);
    set((s) => ({ actorEventLinks: s.actorEventLinks.filter((l) => l.id !== linkId) }));
  },

  saveBriefing: async (userId, briefing) => {
    await api.upsertDailyBriefing(userId, briefing);
    const briefings = await api.fetchDailyBriefings(userId);
    set({ briefings });
  },

  removeBriefing: async (id) => {
    await api.deleteDailyBriefing(id);
    set((s) => ({ briefings: s.briefings.filter((b) => b.id !== id) }));
  },
}));
