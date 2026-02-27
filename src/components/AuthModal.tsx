import { useState } from 'react';
import { X, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

export default function AuthModal() {
  const { authOpen, setAuthOpen, setUser, user } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!authOpen) return null;

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
          setAuthOpen(false);
        }
      } else {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        if (data.session && data.user) {
          setUser({ id: data.user.id, email: data.user.email || email });
          setAuthOpen(false);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setAuthOpen(false)}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm mx-4 bg-surface border border-theme rounded-2xl shadow-2xl overflow-hidden anim-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-theme">
          <h2 className="font-display font-semibold text-main">
            {user ? 'Account' : mode === 'login' ? 'Anmelden' : 'Registrieren'}
          </h2>
          <button onClick={() => setAuthOpen(false)} className="text-muted hover:text-main transition-colors">
            <X size={18} />
          </button>
        </div>

        {user ? (
          <div className="p-5 space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-accent-500/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-accent-400 text-xl font-display font-bold">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-main font-medium">{user.email}</p>
              <p className="text-xs text-muted mt-1">Angemeldet</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-terra-500/15 text-terra-400 text-sm font-medium hover:bg-terra-500/25 transition-colors"
            >
              Abmelden
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3">
            {error && (
              <div className="px-3 py-2 rounded-lg bg-terra-500/10 text-terra-400 text-xs">{error}</div>
            )}
            {success && (
              <div className="px-3 py-2 rounded-lg bg-sage-500/10 text-sage-400 text-xs">{success}</div>
            )}
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-Mail"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-theme text-main text-sm outline-none focus:border-accent-500/50 transition-colors placeholder:text-muted"
              />
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Passwort"
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-theme text-main text-sm outline-none focus:border-accent-500/50 transition-colors placeholder:text-muted"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn size={14} /> Anmelden
                </>
              ) : (
                <>
                  <UserPlus size={14} /> Registrieren
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="w-full text-center text-xs text-muted hover:text-accent-400 transition-colors"
            >
              {mode === 'login' ? 'Noch kein Account? Registrieren' : 'Bereits registriert? Anmelden'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
