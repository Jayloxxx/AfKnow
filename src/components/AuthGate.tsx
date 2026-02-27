import { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, UserPlus, Globe, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useStore();
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      }
      setChecking(false);
    });
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      } else {
        setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Still checking session
  if (checking) {
    return (
      <div className="h-screen w-screen bg-[#0a0c10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  // User is logged in — show the app
  if (user) return <>{children}</>;

  // ── Login Screen ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email || email });
        }
      } else {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        if (data.session && data.user) {
          setUser({ id: data.user.id, email: data.user.email || email });
        } else {
          setSuccess('Registrierung erfolgreich! Bitte bestätige deine E-Mail.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0a0c10] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 30% 20%, rgba(212, 167, 79, 0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(212, 167, 79, 0.04) 0%, transparent 50%)',
      }} />
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,167,79,0.8) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }} />

      <div className="relative w-full max-w-md mx-4">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(212,167,79,0.15), rgba(212,167,79,0.05))', border: '1px solid rgba(212,167,79,0.2)' }}>
            <Globe size={28} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            Intelligence Platform
          </h1>
          <p className="text-sm text-gray-500 mt-1">Geopolitische Analyse & Sicherheitsdaten</p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border overflow-hidden" style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
          borderColor: 'rgba(255,255,255,0.08)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {/* Tab switcher */}
          <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className="flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{
                color: mode === 'login' ? '#D4A74F' : 'rgba(255,255,255,0.35)',
                background: mode === 'login' ? 'rgba(212,167,79,0.06)' : 'transparent',
                borderBottom: mode === 'login' ? '2px solid #D4A74F' : '2px solid transparent',
              }}
            >
              <LogIn size={14} /> Anmelden
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className="flex-1 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
              style={{
                color: mode === 'register' ? '#D4A74F' : 'rgba(255,255,255,0.35)',
                background: mode === 'register' ? 'rgba(212,167,79,0.06)' : 'transparent',
                borderBottom: mode === 'register' ? '2px solid #D4A74F' : '2px solid transparent',
              }}
            >
              <UserPlus size={14} /> Registrieren
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="px-3 py-2.5 rounded-lg text-xs font-medium" style={{
                background: 'rgba(239,68,68,0.1)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.15)',
              }}>
                {error}
              </div>
            )}
            {success && (
              <div className="px-3 py-2.5 rounded-lg text-xs font-medium" style={{
                background: 'rgba(34,197,94,0.1)',
                color: '#4ade80',
                border: '1px solid rgba(34,197,94,0.15)',
              }}>
                {success}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">E-Mail</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com" required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all placeholder:text-gray-600"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(212,167,79,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Passwort</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Mindestens 6 Zeichen' : '••••••••'}
                  required minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all placeholder:text-gray-600"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(212,167,79,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #D4A74F, #b8892e)',
                color: '#0a0c10',
                boxShadow: '0 4px 16px rgba(212,167,79,0.2)',
              }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <><LogIn size={14} /> Anmelden</>
              ) : (
                <><UserPlus size={14} /> Account erstellen</>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 pb-5 flex items-center gap-2 justify-center">
            <Shield size={10} className="text-gray-600" />
            <span className="text-[10px] text-gray-600">Daten werden verschlüsselt in Supabase gespeichert</span>
          </div>
        </div>
      </div>
    </div>
  );
}
