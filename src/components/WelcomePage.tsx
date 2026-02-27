import { useNavigate } from 'react-router-dom';
import { Globe, Map as MapIcon, Layers, Shield, Users, TrendingUp, ChevronRight, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

const features = [
  {
    icon: Globe,
    title: 'Interaktive Karte',
    desc: 'Länder mit politischen, wirtschaftlichen und geographischen Ansichten erkunden.',
  },
  {
    icon: Shield,
    title: 'Sicherheitslage',
    desc: 'Konflikte, Akteure, Militärdaten und internationale Missionen im Überblick.',
  },
  {
    icon: TrendingUp,
    title: 'Wirtschaft & Politik',
    desc: 'BIP, Regierungsformen, Handelsbeziehungen und politische Systeme verstehen.',
  },
  {
    icon: Users,
    title: 'Humanitäre Lage',
    desc: 'Flüchtlingsbewegungen, humanitäre Krisen und Infrastrukturprojekte verfolgen.',
  },
  {
    icon: Layers,
    title: 'Karten-Editor',
    desc: 'Eigene Karten mit Markierungen, Symbolen und Annotationen erstellen und exportieren.',
  },
  {
    icon: MapIcon,
    title: 'Mehrere Kartentypen',
    desc: 'Politisch, Satellit, Topographisch, OpenStreetMap und mehr — alles in einer Plattform.',
  },
];

const regions = [
  {
    id: 'africa' as const,
    name: 'AfKnow',
    subtitle: 'Africa Intelligence Platform',
    description: '54 afrikanische Länder — von Wirtschaft und Politik über Sicherheit bis hin zu humanitären Daten.',
    path: '/africa',
    shortName: 'Af',
    accentClass: 'gold',
    countryCount: '54',
    emoji: '🌍',
  },
  {
    id: 'mideast' as const,
    name: 'MEKnow',
    subtitle: 'Middle East Intelligence Platform',
    description: '20 Länder des Nahen und Mittleren Ostens — Geopolitik, Konflikte, Wirtschaft und Sicherheit.',
    path: '/mideast',
    shortName: 'ME',
    accentClass: 'emerald',
    countryCount: '20',
    emoji: '🕌',
  },
];

export default function WelcomePage() {
  const navigate = useNavigate();
  const { theme, toggleTheme, user, setUser } = useStore();

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
    document.documentElement.removeAttribute('data-region');
  }, [theme]);

  return (
    <div className="min-h-screen bg-main text-main grain-overlay flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gold-500/20 flex items-center justify-center">
            <Globe size={17} className="text-gold-400" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight text-main">Intelligence Platform</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={async () => { await supabase.auth.signOut(); setUser(null); }}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-red-400 transition-colors"
            >
              <LogOut size={13} />
              Abmelden
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="text-xs text-muted hover:text-main transition-colors"
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        <div className="max-w-3xl mx-auto text-center anim-fade-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium mb-8">
            <Globe size={13} />
            Geopolitical Intelligence Platform
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight mb-5">
            Regionen verstehen.
            <br />
            <span className="text-gold-400">Wissen, das zählt.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-12">
            Interaktive Plattform für geopolitisches Wissen —
            von Wirtschaft und Politik über Sicherheit bis hin zu humanitären Daten.
            Wähle deine Region.
          </p>

          {/* Region Selection Cards */}
          <div className="flex flex-col sm:flex-row gap-5 max-w-2xl mx-auto mb-16">
            {regions.map((r, i) => {
              const isGold = r.accentClass === 'gold';
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(r.path)}
                  className={`
                    group flex-1 p-6 rounded-2xl text-left transition-all duration-200
                    hover:scale-[1.02] active:scale-[0.98]
                    border bg-surface
                    ${isGold
                      ? 'border-gold-500/20 hover:border-gold-500/40 hover:shadow-lg hover:shadow-gold-500/10'
                      : 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10'
                    }
                    anim-fade-up
                  `}
                  style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      isGold ? 'bg-gold-500/15' : 'bg-emerald-500/15'
                    }`}>
                      <span className={`font-display font-bold text-base ${
                        isGold ? 'text-gold-400' : 'text-emerald-400'
                      }`}>{r.shortName}</span>
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-main">{r.name}</h3>
                      <p className={`text-[10px] font-medium uppercase tracking-wider ${
                        isGold ? 'text-gold-400/70' : 'text-emerald-400/70'
                      }`}>{r.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted leading-relaxed mb-4">{r.description}</p>

                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-medium ${
                      isGold ? 'text-gold-400' : 'text-emerald-400'
                    }`}>{r.countryCount} Länder</span>
                    <div className={`flex items-center gap-1 text-xs font-medium transition-all
                      ${isGold ? 'text-gold-400' : 'text-emerald-400'}
                    `}>
                      Erkunden
                      <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`
                  p-5 rounded-xl bg-surface border border-theme
                  hover:border-gold-500/30 transition-all duration-200
                  anim-fade-up
                `}
                style={{ animationDelay: `${0.3 + i * 0.06}s` }}
              >
                <div className="w-9 h-9 rounded-lg bg-gold-500/10 flex items-center justify-center mb-3">
                  <Icon size={17} className="text-gold-400" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-muted text-xs leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-muted text-xs border-t border-theme">
        AfKnow &middot; MEKnow — Geopolitical Intelligence Platform
      </footer>
    </div>
  );
}
