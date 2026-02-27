import { supabase } from './supabase';
import type { IntelReport, MosaicEvent, IntelActor, DailyBriefing, IntelEventLink, ActorEventLink } from '../types/intel';

// ── Intel Reports ──────────────────────────

export async function fetchIntelReports(userId: string): Promise<IntelReport[]> {
  const { data, error } = await supabase
    .from('intel_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchIntelReports:', error); return []; }
  return (data ?? []).map(mapReport);
}

export async function upsertIntelReport(userId: string, report: Partial<IntelReport> & { id: string }) {
  const { error } = await supabase.from('intel_reports').upsert({
    id: report.id,
    user_id: userId,
    title: report.title,
    content: report.content,
    source_type: report.sourceType,
    source_name: report.sourceName,
    source_url: report.sourceUrl ?? '',
    category: report.category,
    severity: report.severity,
    verification_status: report.verificationStatus,
    region: report.region ?? '',
    country_ids: report.countryIds ?? [],
    latitude: report.latitude ?? null,
    longitude: report.longitude ?? null,
    location_label: report.locationLabel ?? '',
    tags: report.tags ?? [],
    analyst_notes: report.analystNotes ?? '',
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('upsertIntelReport:', error);
}

export async function deleteIntelReport(id: string) {
  const { error } = await supabase.from('intel_reports').delete().eq('id', id);
  if (error) console.error('deleteIntelReport:', error);
}

function mapReport(r: any): IntelReport {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    content: r.content,
    sourceType: r.source_type,
    sourceName: r.source_name,
    sourceUrl: r.source_url ?? '',
    category: r.category,
    severity: r.severity,
    verificationStatus: r.verification_status,
    region: r.region ?? '',
    countryIds: r.country_ids ?? [],
    latitude: r.latitude,
    longitude: r.longitude,
    locationLabel: r.location_label ?? '',
    tags: r.tags ?? [],
    analystNotes: r.analyst_notes ?? '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ── Mosaic Events ──────────────────────────

export async function fetchMosaicEvents(userId: string): Promise<MosaicEvent[]> {
  const { data, error } = await supabase
    .from('mosaic_events')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) { console.error('fetchMosaicEvents:', error); return []; }
  return (data ?? []).map(mapEvent);
}

export async function upsertMosaicEvent(userId: string, event: Partial<MosaicEvent> & { id: string }) {
  const { error } = await supabase.from('mosaic_events').upsert({
    id: event.id,
    user_id: userId,
    title: event.title,
    description: event.description ?? '',
    category: event.category,
    region: event.region ?? '',
    country_ids: event.countryIds ?? [],
    status: event.status,
    trend: event.trend,
    severity: event.severity,
    started_at: event.startedAt ?? null,
    tags: event.tags ?? [],
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('upsertMosaicEvent:', error);
}

export async function deleteMosaicEvent(id: string) {
  const { error } = await supabase.from('mosaic_events').delete().eq('id', id);
  if (error) console.error('deleteMosaicEvent:', error);
}

function mapEvent(r: any): MosaicEvent {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    description: r.description ?? '',
    category: r.category,
    region: r.region ?? '',
    countryIds: r.country_ids ?? [],
    status: r.status,
    trend: r.trend,
    severity: r.severity,
    startedAt: r.started_at,
    tags: r.tags ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ── Intel-Event Links ──────────────────────────

export async function fetchIntelEventLinks(userId: string): Promise<IntelEventLink[]> {
  const { data, error } = await supabase
    .from('intel_event_links')
    .select('*')
    .eq('user_id', userId);
  if (error) { console.error('fetchIntelEventLinks:', error); return []; }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    intelReportId: r.intel_report_id,
    mosaicEventId: r.mosaic_event_id,
  }));
}

export async function createIntelEventLink(userId: string, intelReportId: string, mosaicEventId: string) {
  const { error } = await supabase.from('intel_event_links').insert({
    user_id: userId,
    intel_report_id: intelReportId,
    mosaic_event_id: mosaicEventId,
  });
  if (error) console.error('createIntelEventLink:', error);
}

export async function deleteIntelEventLink(id: string) {
  const { error } = await supabase.from('intel_event_links').delete().eq('id', id);
  if (error) console.error('deleteIntelEventLink:', error);
}

// ── Actors ──────────────────────────

export async function fetchIntelActors(userId: string): Promise<IntelActor[]> {
  const { data, error } = await supabase
    .from('intel_actors')
    .select('*')
    .eq('user_id', userId)
    .order('name');
  if (error) { console.error('fetchIntelActors:', error); return []; }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    type: r.type,
    description: r.description ?? '',
    country: r.country ?? '',
    tags: r.tags ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

export async function upsertIntelActor(userId: string, actor: Partial<IntelActor> & { id: string }) {
  const { error } = await supabase.from('intel_actors').upsert({
    id: actor.id,
    user_id: userId,
    name: actor.name,
    type: actor.type,
    description: actor.description ?? '',
    country: actor.country ?? '',
    tags: actor.tags ?? [],
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('upsertIntelActor:', error);
}

export async function deleteIntelActor(id: string) {
  const { error } = await supabase.from('intel_actors').delete().eq('id', id);
  if (error) console.error('deleteIntelActor:', error);
}

// ── Actor-Event Links ──────────────────────────

export async function fetchActorEventLinks(userId: string): Promise<ActorEventLink[]> {
  const { data, error } = await supabase
    .from('actor_event_links')
    .select('*')
    .eq('user_id', userId);
  if (error) { console.error('fetchActorEventLinks:', error); return []; }
  return (data ?? []).map((r: any) => ({
    id: r.id,
    actorId: r.actor_id,
    mosaicEventId: r.mosaic_event_id,
    role: r.role ?? '',
  }));
}

export async function createActorEventLink(userId: string, actorId: string, mosaicEventId: string, role: string) {
  const { error } = await supabase.from('actor_event_links').insert({
    user_id: userId,
    actor_id: actorId,
    mosaic_event_id: mosaicEventId,
    role,
  });
  if (error) console.error('createActorEventLink:', error);
}

export async function deleteActorEventLink(id: string) {
  const { error } = await supabase.from('actor_event_links').delete().eq('id', id);
  if (error) console.error('deleteActorEventLink:', error);
}

// ── Daily Briefings ──────────────────────────

export async function fetchDailyBriefings(userId: string): Promise<DailyBriefing[]> {
  const { data, error } = await supabase
    .from('daily_briefings')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) { console.error('fetchDailyBriefings:', error); return []; }
  return (data ?? []).map(mapBriefing);
}

export async function upsertDailyBriefing(userId: string, briefing: Partial<DailyBriefing> & { id: string }) {
  const { error } = await supabase.from('daily_briefings').upsert({
    id: briefing.id,
    user_id: userId,
    date: briefing.date,
    title: briefing.title ?? '',
    priority_alerts: briefing.priorityAlerts ?? '',
    situation_updates: briefing.situationUpdates ?? '',
    trend_analysis: briefing.trendAnalysis ?? '',
    mosaic_updates: briefing.mosaicUpdates ?? '',
    forecast: briefing.forecast ?? '',
    updated_at: new Date().toISOString(),
  });
  if (error) console.error('upsertDailyBriefing:', error);
}

export async function deleteDailyBriefing(id: string) {
  const { error } = await supabase.from('daily_briefings').delete().eq('id', id);
  if (error) console.error('deleteDailyBriefing:', error);
}

function mapBriefing(r: any): DailyBriefing {
  return {
    id: r.id,
    userId: r.user_id,
    date: r.date,
    title: r.title ?? '',
    priorityAlerts: r.priority_alerts ?? '',
    situationUpdates: r.situation_updates ?? '',
    trendAnalysis: r.trend_analysis ?? '',
    mosaicUpdates: r.mosaic_updates ?? '',
    forecast: r.forecast ?? '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
