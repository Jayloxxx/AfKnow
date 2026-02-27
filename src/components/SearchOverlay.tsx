import { useEffect, useRef, useMemo } from 'react';
import { Search, X, MapPin, Waves, Building2, Plane, Globe } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRegion } from '../context/RegionContext';
import type { SearchResult } from '../types';

export default function SearchOverlay() {
  const { searchOpen, setSearchOpen, searchQuery, setSearchQuery, selectCountry, setActiveTab } = useStore();
  const region = useRegion();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  const results = useMemo<SearchResult[]>(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const res: SearchResult[] = [];
    const { countries, rivers } = region;

    // Search countries
    countries.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.id.toLowerCase() === q ||
        c.region.toLowerCase().includes(q)
      ) {
        res.push({ type: 'country', id: c.id, name: c.name, subtitle: `${c.capital} · ${c.region}` });
      }
    });

    // Search cities within countries
    countries.forEach((c) => {
      c.majorCities.forEach((city) => {
        if (city.name.toLowerCase().includes(q)) {
          res.push({
            type: 'city', id: `${c.id}-${city.name}`, name: city.name,
            subtitle: `Stadt in ${c.name}`, countryId: c.id,
          });
        }
      });
      c.airports.forEach((ap) => {
        if (ap.name.toLowerCase().includes(q)) {
          res.push({
            type: 'airport', id: `${c.id}-${ap.name}`, name: ap.name,
            subtitle: `Flughafen in ${c.name}`, countryId: c.id,
          });
        }
      });
    });

    // Search rivers
    rivers.forEach((r) => {
      if (r.name.toLowerCase().includes(q)) {
        res.push({
          type: 'river', id: r.id, name: r.name,
          subtitle: `${r.length.toLocaleString()} km · ${r.countries.length} Länder`,
        });
      }
    });

    // Intelligent search: also search detail text
    if (res.length < 5) {
      countries.forEach((c) => {
        const alreadyFound = res.some((r) => r.type === 'country' && r.id === c.id);
        if (alreadyFound) return;
        const allText = Object.values(c.details).map((d) => d.text).join(' ').toLowerCase();
        if (allText.includes(q)) {
          res.push({
            type: 'country', id: c.id, name: c.name,
            subtitle: `Erwähnt "${searchQuery}" · ${c.region}`,
          });
        }
      });
    }

    return res.slice(0, 20);
  }, [searchQuery, region]);

  if (!searchOpen) return null;

  const iconMap = {
    country: Globe,
    city: Building2,
    airport: Plane,
    river: Waves,
  };

  const handleSelect = (r: SearchResult) => {
    if (r.type === 'country') {
      selectCountry(r.id);
      setActiveTab('explorer');
    } else if (r.countryId) {
      selectCountry(r.countryId);
      setActiveTab('explorer');
    }
    setSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]" onClick={() => setSearchOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl mx-4 bg-surface border border-theme rounded-2xl shadow-2xl overflow-hidden anim-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-theme">
          <Search size={18} style={{ color: region.accentHex }} className="shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Länder, Städte, Flüsse, Flughäfen suchen..."
            className="flex-1 bg-transparent text-main text-sm outline-none placeholder:text-muted font-body"
          />
          <button onClick={() => setSearchOpen(false)} className="text-muted hover:text-main transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {searchQuery && results.length === 0 && (
            <div className="px-4 py-8 text-center text-muted text-sm">
              Keine Ergebnisse für &ldquo;{searchQuery}&rdquo;
            </div>
          )}
          {results.map((r, i) => {
            const Icon = iconMap[r.type];
            return (
              <button
                key={r.id + i}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-hover transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-card border border-theme flex items-center justify-center shrink-0">
                  <Icon size={14} style={{ color: region.accentHex }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-main truncate">{r.name}</div>
                  <div className="text-xs text-muted truncate">{r.subtitle}</div>
                </div>
                <MapPin size={12} className="text-muted shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-theme text-[10px] text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-card border border-theme">↑↓</kbd> Navigation
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-card border border-theme">Enter</kbd> Auswählen
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-card border border-theme">Esc</kbd> Schließen
          </span>
        </div>
      </div>
    </div>
  );
}
