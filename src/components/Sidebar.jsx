import { useMemo, useState } from 'react';

export default function Sidebar({ open, stations, role, isAdmin, onSelect, onOpenModal, onLogout }) {
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const needle = q.toLowerCase();
    return stations.filter((s) => `${s.sender} Message: ${s.message || 'No message'}`.toLowerCase().includes(needle));
  }, [stations, q]);

  return (
    <div id="sidebar" className={open ? 'open' : ''}>
      <div id="sidebar-container">
        <div className="sidebar-group">
          <div className="sidebar-summary-row">
            <div className="count-div">Fishermen ({stations.length})</div>
            {role && (
              <div id="roleStatus" className="sidebar-role-status">
                <span className="sidebar-role-badge">{role} mode</span>
              </div>
            )}
          </div>
          <div className="sidebar-search-shell">
            <input className="sidebar-search-field" type="text" placeholder="Search Callsign..."
              value={q} onChange={(e) => setQ(e.target.value)} />
            <img src="/assets/icons/search.png" alt="" className="sidebar-search-icon" width="15" height="15" />
          </div>

          <ul id="senderList">
            {list.map((s) => (
              <li key={s.sender} onClick={() => onSelect(s.sender)}>
                <span className="highlight">{s.sender}</span><br />
                Message: {s.message || 'No message'}
              </li>
            ))}
            {list.length === 0 && (
              <li style={{ textAlign: 'center', color: '#fff', padding: 8, marginTop: 5 }}>No results found</li>
            )}
          </ul>
        </div>
        <div className="line-sidebar" />

        <div className="button-sidebar">
          <button onClick={() => onOpenModal('history')}>
            <img src="/assets/icons/file-white.png" alt="" /> View Fishermen History
          </button>
          <button onClick={() => onOpenModal('sos')}>
            <img src="/assets/icons/sos.png" alt="" /> SOS Report
          </button>
          <button onClick={() => onOpenModal('info')}>
            <img src="/assets/icons/info.png" alt="" /> Fishermen's Information
          </button>
          {isAdmin && (
            <button onClick={() => onOpenModal('credentials')}>
              <img src="/assets/icons/details.png" alt="" /> Change Admin Login
            </button>
          )}
          {role && (
            <button className="sidebar-logout-btn" onClick={onLogout}>
              <img src="/assets/icons/delete.png" alt="" /> Log Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
