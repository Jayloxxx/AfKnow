import { Search, Sun, Moon, Map as MapIcon, Globe, Layers, Home, User, Radio, Shield, Crosshair, Radar, Satellite, Swords, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useRegion } from '../context/RegionContext';

const tabs = [
  { id: 'explorer' as const, label: 'Explorer', icon: Globe },
  { id: 'live-intel' as const, label: 'Live Intel', icon: Radio },
  { id: 'op-lage' as const, label: 'Operative Lage', icon: Shield },
  { id: 'takt-lage' as const, label: 'Taktische Lage', icon: Crosshair },
  { id: 'intel-mosaic' as const, label: 'MOSAIC Intel', icon: Radar },
  { id: 'osint-lage' as const, label: 'OSINT Lage', icon: Satellite },
  { id: 'mil-vergleich' as const, label: 'Mil. Vergleich', icon: Swords },
  { id: 'knowledge' as const, label: 'Wissensdatenbank', icon: BookOpen },
  { id: 'editor' as const, label: 'Karten-Editor', icon: Layers },
  { id: 'my-maps' as const, label: 'Meine Karten', icon: MapIcon },
];

export default function Header() {
  const {
    theme, toggleTheme, activeTab, setActiveTab,
    setSearchOpen, user, setAuthOpen,
  } = useStore();
  const region = useRegion();
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-surface border-b border-theme flex items-center px-4 gap-2 relative z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-4 shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${region.accentHex} 20%, transparent)` }}>
          <span className="font-display font-bold text-sm" style={{ color: region.accentHex }}>{region.shortName}</span>
        </div>
        <h1 className="font-display font-semibold text-base tracking-tight text-main hidden sm:block">
          {region.name}
        </h1>
      </div>

      {/* Tab Navigation */}
      <nav className="flex items-center gap-0.5 bg-card rounded-lg p-0.5 border border-theme">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${active
                  ? 'shadow-sm'
                  : 'text-muted hover:text-main hover:bg-hover'
                }
              `}
              style={active ? {
                background: `color-mix(in srgb, ${region.accentHex} 15%, transparent)`,
                color: region.accentHex,
              } : undefined}
            >
              <Icon size={14} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      {/* Search Button */}
      <button
        onClick={() => setSearchOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-theme text-muted hover:text-main transition-all text-xs"
        style={{ borderColor: undefined }}
      >
        <Search size={14} />
        <span className="hidden sm:inline">Suchen...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-hover border border-theme text-[10px] font-mono">
          Ctrl+K
        </kbd>
      </button>

      {/* Home Button */}
      <button
        onClick={() => navigate('/')}
        className="w-8 h-8 rounded-lg bg-card border border-theme flex items-center justify-center text-muted hover:text-main transition-all"
        title="Zur Regionsauswahl"
      >
        <Home size={15} />
      </button>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="w-8 h-8 rounded-lg bg-card border border-theme flex items-center justify-center text-muted transition-all"
        style={{ ['--hover-color' as string]: region.accentHex }}
        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Auth Button */}
      <button
        onClick={() => setAuthOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-medium"
        style={user ? {
          background: `color-mix(in srgb, ${region.accentHex} 12%, transparent)`,
          borderColor: `color-mix(in srgb, ${region.accentHex} 25%, transparent)`,
          color: region.accentHex,
        } : {
          background: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--muted)',
        }}
        title={user ? user.email : 'Anmelden'}
      >
        {user ? (
          <>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: `color-mix(in srgb, ${region.accentHex} 25%, transparent)` }}>
              {user.email.charAt(0).toUpperCase()}
            </div>
            <span className="hidden lg:inline max-w-[100px] truncate">{user.email}</span>
          </>
        ) : (
          <>
            <User size={14} />
            <span className="hidden sm:inline">Anmelden</span>
          </>
        )}
      </button>

    </header>
  );
}
