import { useState, useEffect } from 'react';
import { WifiOff, HardDrive } from 'lucide-react';

interface Props {
  onOpenPredownload?: () => void;
}

export default function OfflineBanner({ onOpenPredownload }: Props) {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div style={{
      position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
      zIndex: 100, display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', borderRadius: 8,
      background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      <WifiOff size={12} style={{ color: '#f59e0b' }} />
      <span style={{ fontSize: 10, fontWeight: 600, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>
        Offline — Karten aus Cache
      </span>
      {onOpenPredownload && (
        <button onClick={onOpenPredownload}
          style={{
            display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px',
            borderRadius: 4, border: '1px solid rgba(245,158,11,0.4)',
            background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
            fontSize: 9, fontFamily: 'var(--font-display)', cursor: 'pointer',
          }}>
          <HardDrive size={9} /> Cache
        </button>
      )}
    </div>
  );
}
