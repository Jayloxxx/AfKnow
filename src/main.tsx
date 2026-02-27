import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import AuthGate from './components/AuthGate';
import WelcomePage from './components/WelcomePage';
import RegionApp from './components/RegionApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthGate>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/africa" element={<RegionApp regionId="africa" />} />
          <Route path="/mideast" element={<RegionApp regionId="mideast" />} />
          <Route path="/app" element={<Navigate to="/africa" replace />} />
        </Routes>
      </AuthGate>
    </BrowserRouter>
  </StrictMode>
);
