import { useEffect, useState } from 'react';
import { RegionProvider } from '../context/RegionContext';
import type { RegionConfig } from '../context/RegionContext';
import { africaConfig } from '../config/africaConfig';
import { initMideastConfig } from '../config/mideastConfig';
import App from '../App';

interface RegionAppProps {
  regionId: 'africa' | 'mideast';
}

export default function RegionApp({ regionId }: RegionAppProps) {
  const [config, setConfig] = useState<RegionConfig | null>(
    regionId === 'africa' ? africaConfig : null
  );

  useEffect(() => {
    if (regionId === 'mideast') {
      initMideastConfig().then(setConfig);
    } else {
      setConfig(africaConfig);
    }
  }, [regionId]);

  useEffect(() => {
    if (config) {
      document.documentElement.setAttribute('data-region', config.id);
    }
    return () => {
      document.documentElement.removeAttribute('data-region');
    };
  }, [config]);

  if (!config) {
    return (
      <div className="h-screen flex items-center justify-center bg-main text-main">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">MEKnow wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <RegionProvider config={config}>
      <App />
    </RegionProvider>
  );
}
