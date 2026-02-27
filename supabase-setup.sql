-- ═══════════════════════════════════════════════════════════
-- AfKnow Supabase Setup — Run this in the SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 1. User markers
CREATE TABLE IF NOT EXISTS user_markers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  coords FLOAT8[] NOT NULL,
  type TEXT DEFAULT 'custom',
  color TEXT DEFAULT '#D4A74F',
  notes TEXT,
  country_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Saved maps
CREATE TABLE IF NOT EXISTS saved_maps (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  elements JSONB DEFAULT '[]',
  thumbnail TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Custom military data edits
CREATE TABLE IF NOT EXISTS custom_military_data (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_id TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, country_id)
);

-- 4. User settings/preferences
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'dark',
  show_rivers BOOLEAN DEFAULT true,
  show_capitals BOOLEAN DEFAULT true,
  show_airports BOOLEAN DEFAULT false,
  show_ports BOOLEAN DEFAULT true,
  show_labels BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Row Level Security ═══
ALTER TABLE user_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_military_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 5. Custom country details (multiple knowledge entries per tab)
CREATE TABLE IF NOT EXISTS custom_country_details (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_id TEXT NOT NULL,
  tab_key TEXT NOT NULL,
  text TEXT NOT NULL,
  source TEXT DEFAULT '',
  source_label TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE custom_country_details ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "own_details" ON custom_country_details;
DROP POLICY IF EXISTS "own_markers" ON user_markers;
DROP POLICY IF EXISTS "own_maps" ON saved_maps;
DROP POLICY IF EXISTS "own_mil_data" ON custom_military_data;
DROP POLICY IF EXISTS "own_settings" ON user_settings;

CREATE POLICY "own_markers" ON user_markers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_maps" ON saved_maps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_mil_data" ON custom_military_data FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_details" ON custom_country_details FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- MOSAIC Intel Engine Tables
-- ═══════════════════════════════════════════════════════════

-- 6. Intel Reports — individual intelligence items
CREATE TABLE IF NOT EXISTS intel_reports (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'manual',
  source_name TEXT NOT NULL DEFAULT '',
  source_url TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'security',
  severity INT NOT NULL DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
  verification_status TEXT NOT NULL DEFAULT 'unconfirmed',
  region TEXT DEFAULT '',
  country_ids TEXT[] DEFAULT '{}',
  latitude FLOAT8,
  longitude FLOAT8,
  location_label TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  analyst_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Mosaic Events — overarching events/storylines
CREATE TABLE IF NOT EXISTS mosaic_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'conflict',
  region TEXT DEFAULT '',
  country_ids TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  trend TEXT NOT NULL DEFAULT 'stable',
  severity INT NOT NULL DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
  started_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Intel → Event links (many-to-many)
CREATE TABLE IF NOT EXISTS intel_event_links (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  intel_report_id TEXT REFERENCES intel_reports(id) ON DELETE CASCADE NOT NULL,
  mosaic_event_id TEXT REFERENCES mosaic_events(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(intel_report_id, mosaic_event_id)
);

-- 9. Actors — persons, organizations, states involved
CREATE TABLE IF NOT EXISTS intel_actors (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'organization',
  description TEXT DEFAULT '',
  country TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Actor → Event links
CREATE TABLE IF NOT EXISTS actor_event_links (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  actor_id TEXT REFERENCES intel_actors(id) ON DELETE CASCADE NOT NULL,
  mosaic_event_id TEXT REFERENCES mosaic_events(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(actor_id, mosaic_event_id)
);

-- 11. Daily Briefings
CREATE TABLE IF NOT EXISTS daily_briefings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL DEFAULT '',
  priority_alerts TEXT DEFAULT '',
  situation_updates TEXT DEFAULT '',
  trend_analysis TEXT DEFAULT '',
  mosaic_updates TEXT DEFAULT '',
  forecast TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- RLS for Intel tables
ALTER TABLE intel_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE mosaic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_event_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE intel_actors ENABLE ROW LEVEL SECURITY;
ALTER TABLE actor_event_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_briefings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_intel_reports" ON intel_reports;
DROP POLICY IF EXISTS "own_mosaic_events" ON mosaic_events;
DROP POLICY IF EXISTS "own_intel_event_links" ON intel_event_links;
DROP POLICY IF EXISTS "own_intel_actors" ON intel_actors;
DROP POLICY IF EXISTS "own_actor_event_links" ON actor_event_links;
DROP POLICY IF EXISTS "own_daily_briefings" ON daily_briefings;

CREATE POLICY "own_intel_reports" ON intel_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_mosaic_events" ON mosaic_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_intel_event_links" ON intel_event_links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_intel_actors" ON intel_actors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_actor_event_links" ON actor_event_links FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own_daily_briefings" ON daily_briefings FOR ALL USING (auth.uid() = user_id);
