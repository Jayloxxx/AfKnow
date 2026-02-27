import { useState, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, MousePointer2, Layers, Clock, Shield, Crosshair, Map as MapIcon } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  icon: typeof MousePointer2;
  highlight?: string; // CSS selector hint
  tips: string[];
}

const STEPS: TutorialStep[] = [
  {
    title: 'Willkommen im Karteneditor',
    icon: MapIcon,
    description: 'Dieses professionelle Kartentool bietet militarische Analyse- und Visualisierungsfunktionen auf strategischem, operativem und taktischem Niveau.',
    tips: [
      'Links: Lander auswahlen und zur Karte hinzufugen',
      'Mitte: Interaktive Karte mit Zeichenwerkzeugen',
      'Rechts: Layer-Panel und Eigenschaften',
      'Unten: Timeline fur zeitliche Phasen',
    ],
  },
  {
    title: 'Navigation & Werkzeuge',
    icon: MousePointer2,
    description: 'Navigiere effizient auf der Karte und nutze die Werkzeugpalette.',
    tips: [
      'Mausrad: Karte zoomen',
      'Rechtsklick ziehen: Karte bewegen',
      'Leertaste halten: Temporarer Verschiebe-Modus',
      'Tastenkurzel: V (Auswahl), T (Text), R (Rechteck), A (Pfeil), etc.',
      'Doppelklick: Polygon/Zone abschliessen',
    ],
  },
  {
    title: 'Layer-System',
    icon: Layers,
    description: 'Verwalte deine Kartenelemente wie in Photoshop mit dem Layer-Panel.',
    tips: [
      'Drag & Drop: Layer-Reihenfolge andern',
      'Auge-Icon: Layer ein-/ausblenden',
      'Schloss-Icon: Layer sperren',
      'Gruppen: Elemente logisch zusammenfassen',
      'Lander und Elemente getrennt verwalten',
    ],
  },
  {
    title: 'NATO-Symbole & Fraktionen',
    icon: Shield,
    description: 'Platziere militarische Einheiten nach NATO APP-6 Standard mit Fraktions- und Echelon-System.',
    tips: [
      'Fraktion: Freund (blau), Feind (rot), Neutral (grun), Unbekannt (gelb)',
      'Echelon: Kompanie bis Heeresgruppe',
      'Konfidenz: Bestatigt, Wahrscheinlich, Moglich, Zweifelhaft',
      'Einheitentyp im Symbol-Picker wahlen',
    ],
  },
  {
    title: 'Waffenreichweiten',
    icon: Crosshair,
    description: 'Visualisiere Waffenreichweiten mit vordefinierten Presets fur reale Waffensysteme.',
    tips: [
      'Reichweite-Tool (W): Waffensystem auswahlen',
      'S-300, S-400, Patriot, IRIS-T, HIMARS u.v.m.',
      'Klicke auf die Karte um den Radius zu platzieren',
      'Reichweite wird in km angezeigt',
    ],
  },
  {
    title: 'Timeline & Phasen',
    icon: Clock,
    description: 'Nutze die Timeline um zeitliche Entwicklungen darzustellen.',
    tips: [
      'Phasen erstellen fur verschiedene Zeitpunkte',
      'Elemente konnen Phasen zugewiesen werden',
      'Play-Button: Automatische Wiedergabe',
      'Doppelklick auf Phase-Name zum Umbenennen',
    ],
  },
];

export default function OnboardingTutorial({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const next = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  }, [isLast, onComplete]);

  const prev = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{
        width: 480, maxWidth: '92vw', background: 'var(--ed-panel)',
        border: '1px solid var(--ed-border-strong)',
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Header accent bar */}
        <div style={{
          height: 3, background: `linear-gradient(90deg, var(--accent-hex), color-mix(in srgb, var(--accent-hex) 40%, transparent))`,
        }} />

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>
          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === step ? 'var(--accent-hex)' : i < step ? 'var(--accent-hex)' : 'var(--ed-border-strong)',
                  opacity: i <= step ? 1 : 0.4,
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
            <button onClick={onComplete} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ed-text-dim)', display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 10, fontFamily: 'var(--font-body)',
            }}>
              Uberspringen <X size={12} />
            </button>
          </div>

          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'color-mix(in srgb, var(--accent-hex) 15%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent-hex) 25%, transparent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--accent-hex)',
            }}>
              <Icon size={22} />
            </div>
            <div>
              <h2 style={{
                fontSize: 16, fontWeight: 700, color: 'var(--ed-text)',
                fontFamily: 'var(--font-display)', margin: 0, lineHeight: 1.2,
              }}>
                {current.title}
              </h2>
              <span style={{
                fontSize: 10, color: 'var(--ed-text-dim)', fontFamily: 'var(--font-mono)',
              }}>
                Schritt {step + 1} von {STEPS.length}
              </span>
            </div>
          </div>

          {/* Description */}
          <p style={{
            fontSize: 12, color: 'var(--ed-text-secondary)', lineHeight: 1.6,
            marginBottom: 14, fontFamily: 'var(--font-body)',
          }}>
            {current.description}
          </p>

          {/* Tips */}
          <div style={{
            background: 'var(--ed-btn)', borderRadius: 10,
            padding: '10px 14px', marginBottom: 20,
          }}>
            {current.tips.map((tip, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '4px 0', fontSize: 11, color: 'var(--ed-text-secondary)',
                lineHeight: 1.4,
              }}>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', marginTop: 5,
                  background: 'var(--accent-hex)', flexShrink: 0,
                  opacity: 0.7,
                }} />
                {tip}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button onClick={prev} style={{
                flex: 1, padding: '9px 0', borderRadius: 8,
                border: '1px solid var(--ed-border-strong)',
                background: 'var(--ed-btn)', color: 'var(--ed-text-muted)',
                fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}>
                <ChevronLeft size={14} /> Zuruck
              </button>
            )}
            <button onClick={next} style={{
              flex: 2, padding: '9px 0', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
              color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              fontFamily: 'var(--font-display)',
            }}>
              {isLast ? 'Los geht\'s!' : 'Weiter'} {!isLast && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
