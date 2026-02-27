import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { useSupabaseSync } from './hooks/useSupabaseSync';
import Header from './components/Header';
import AfricaMap from './components/AfricaMap';
import CountryPanel from './components/CountryPanel';
import MapEditor from './components/MapEditor';
import SavedMaps from './components/SavedMaps';
import LiveIntelPanel from './components/LiveIntelPanel';
import OperativeLage from './components/OperativeLage';
import TaktischeLage from './components/TaktischeLage';
import IntelDashboard from './components/intel/IntelDashboard';
import OsintLagePlattform from './components/OsintLagePlattform';
import MilitaerVergleich from './components/MilitaerVergleich';
import KnowledgeBase from './components/knowledge/KnowledgeBase';
import SearchOverlay from './components/SearchOverlay';
import AuthModal from './components/AuthModal';

export default function App() {
  const { theme, activeTab, selectedCountryId } = useStore();

  // Supabase auth + data sync
  useSupabaseSync();

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  return (
    <div className="h-screen flex flex-col bg-main text-main grain-overlay overflow-hidden">
      <Header />

      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'explorer' && (
          <>
            <AfricaMap />
            {selectedCountryId && <CountryPanel />}
          </>
        )}
        {/* Editor stays mounted to preserve state across tab switches */}
        <div style={{ display: activeTab === 'editor' ? 'flex' : 'none', flex: '1 1 0%', minWidth: 0, height: '100%' }}>
          <MapEditor />
        </div>
        {activeTab === 'my-maps' && <SavedMaps />}
        {activeTab === 'live-intel' && <LiveIntelPanel />}
        {activeTab === 'op-lage' && <OperativeLage />}
        {activeTab === 'takt-lage' && <TaktischeLage />}
        {activeTab === 'intel-mosaic' && <IntelDashboard />}
        {activeTab === 'osint-lage' && <OsintLagePlattform />}
        {activeTab === 'mil-vergleich' && <MilitaerVergleich />}
        {activeTab === 'knowledge' && <KnowledgeBase />}
      </main>

      <SearchOverlay />
      <AuthModal />
    </div>
  );
}
