import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import CountdownPage from './pages/CountdownPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LiveCameras from './pages/LiveCameras';
import Vehicles from './pages/Vehicles';
import ANPRRecords from './pages/ANPRRecords';
import Trajectories from './pages/Trajectories';
import Analytics from './pages/Analytics';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import ProtectedRoute from './components/ProtectedRoute';
import AIAssistant from './components/AIAssistant';

function App() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<CountdownPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cameras" element={<LiveCameras />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/anpr" element={<ANPRRecords />} />
          <Route path="/trajectories" element={<Trajectories />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* ─── Floating AI Assistant ─────────────────────────────────── */}
      <AIAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Floating toggle button */}
      {!aiOpen && (
        <button
          id="ai-assistant-toggle"
          onClick={() => setAiOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
            width: 56, height: 56, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            boxShadow: '0 8px 32px rgba(59,130,246,0.5)',
            cursor: 'pointer', fontSize: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          title="Open AI Operations Assistant"
        >
          🤖
        </button>
      )}
    </Router>
  );
}

export default App;
