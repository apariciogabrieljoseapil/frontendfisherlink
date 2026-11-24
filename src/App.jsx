import { useState } from 'react';
import { api } from './api';
import { useAuth } from './context/AuthContext.jsx';
import { useStations } from './hooks/useStations';
import { useNow } from './hooks/useNow';
import AuthModal from './components/AuthModal.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import MapView from './components/MapView.jsx';
import { SosAlerts, DelayWarnings } from './components/Alerts.jsx';
import HistoryModal from './components/HistoryModal.jsx';
import SosReportModal from './components/SosReportModal.jsx';
import InformationModal from './components/InformationModal.jsx';
import AdminCredentialsModal from './components/AdminCredentialsModal.jsx';

const ACTION_TEXT = {
  help: { ask: 'mark {s} as "Help on the Way"?', done: 'Help is on the way!' },
  safe: { ask: 'mark {s} as "Safe"? This will reset the status.', done: 'Sender marked as safe!' },
  notfound: { ask: 'mark {s} as "Not Found in Database"?', done: 'Sender marked as Not Found.' }
};

export default function App() {
  const { role, ready, isAdmin, logout } = useAuth();
  const { stations, reload } = useStations(Boolean(role));
  const now = useNow(60000);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(null); // 'history' | 'sos' | 'info' | 'credentials'
  const [historySender, setHistorySender] = useState('');
  const [focus, setFocus] = useState(null);
  const [trail, setTrail] = useState(null);
  const [manualPoint, setManualPoint] = useState(null);

  const openModal = (name) => { setHistorySender(''); setModal(name); };
  const closeModal = () => setModal(null);

  async function searchSender(value) {
    if (!value) return setTrail(null);
    try {
      const r = await api.get(`/stations/${encodeURIComponent(value)}/trail`);
      if (!r.locations.length) return alert('No past locations found for this sender.');
      return setTrail(r);
    } catch (e) {
      return alert(e.message);
    }
  }

  async function statusAction(type, sender) {
    if (!confirm(`Are you sure you want to ${ACTION_TEXT[type].ask.replace('{s}', sender)}`)) return;
    try {
      await api.post(`/stations/${encodeURIComponent(sender)}/${type}`);
      await reload();
      alert(ACTION_TEXT[type].done);
    } catch (e) {
      alert(`Failed to update message: ${e.message}`);
    }
  }

  async function handleLogout() {
    setSidebarOpen(false);
    setModal(null);
    await logout();
  }

  if (!ready) return null;
  if (!role) return <AuthModal />;

  return (
    <>
      <Header
        onSearchSender={searchSender}
        onPlotCoords={setManualPoint}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
      />
      <MapView
        stations={stations}
        now={now}
        isAdmin={isAdmin}
        focus={focus}
        manualPoint={manualPoint}
        trail={trail}
        onAction={statusAction}
      />
      <SosAlerts stations={stations} />
      <DelayWarnings stations={stations} now={now} />

      <Sidebar
        open={sidebarOpen}
        stations={stations}
        role={role}
        isAdmin={isAdmin}
        onSelect={(sender) => setFocus({ sender, nonce: Date.now() })}
        onOpenModal={openModal}
        onLogout={handleLogout}
      />

      {modal === 'history' && <HistoryModal initialSender={historySender} onClose={closeModal} />}
      {modal === 'sos' && <SosReportModal isAdmin={isAdmin} onClose={closeModal} />}
      {modal === 'info' && (
        <InformationModal
          isAdmin={isAdmin}
          onClose={closeModal}
          onChanged={reload}
          onOpenHistory={(callsign) => { setHistorySender(callsign); setModal('history'); }}
        />
      )}
      {modal === 'credentials' && isAdmin && <AdminCredentialsModal onClose={closeModal} />}
    </>
  );
}
