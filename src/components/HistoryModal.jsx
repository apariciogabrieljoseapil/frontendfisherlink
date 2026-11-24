import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../api';
import { withSeconds } from '../utils';
import Modal from './Modal.jsx';

const pin = L.icon({ iconUrl: '/assets/markers/mark-blue.png', iconSize: [50, 50], iconAnchor: [26, 46], popupAnchor: [1, -34] });

function Fit({ plot }) {
  const map = useMap();
  useEffect(() => {
    if (plot.locations) map.fitBounds(L.latLngBounds(plot.locations.map((l) => [l.latitude, l.longitude])));
    else if (plot.point) map.setView([plot.point.latitude, plot.point.longitude], 12);
  }, [plot, map]);
  return null;
}

function HistoryMap({ plot }) {
  return (
    <MapContainer center={[9.1, 125.5]} zoom={8} style={{ height: 420, width: '100%', borderRadius: 8, marginTop: 15 }}>
      <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" attribution="&copy; Google" />
      <Fit plot={plot} />
      {plot.locations && (
        <>
          <Polyline positions={plot.locations.map((l) => [l.latitude, l.longitude])}
            pathOptions={{ color: '#ff4500', weight: 1.5, opacity: 0.8 }} />
          {plot.locations.map((l, i) => (
            <Circle key={i} center={[l.latitude, l.longitude]} radius={100}
              pathOptions={{ color: '#dfff00', fillColor: '#dfff00', fillOpacity: 0.8 }}>
              <Popup>
                <b>Sender:</b> {l.sender}<br /><b>Time:</b> {l.time_received}<br />
                <b>Location:</b> ({l.latitude}, {l.longitude})<br /><b>Message:</b> {l.message || 'No message'}
              </Popup>
            </Circle>
          ))}
        </>
      )}
      {plot.point && (
        <Marker position={[plot.point.latitude, plot.point.longitude]} icon={pin}>
          <Popup>
            <strong>{plot.point.sender}</strong><br />Time: {plot.point.time_received}<br />
            Latitude: {plot.point.latitude.toFixed(6)}<br />Longitude: {plot.point.longitude.toFixed(6)}<br />
            Message: {plot.point.message}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default function HistoryModal({ initialSender = '', onClose }) {
  const [sender, setSender] = useState(initialSender);
  const [f, setF] = useState({ startDate: '', startTime: '', endDate: '', endTime: '' });
  const [history, setHistory] = useState(null); // null = nothing searched yet
  const [plot, setPlot] = useState(null);

  async function search(next = {}) {
    const s = (next.sender ?? sender).trim();
    if (!s) return alert('Please enter a Sender ID');
    const v = { ...f, ...next };
    const qs = new URLSearchParams();
    if (v.startDate) qs.set('start_date', `${v.startDate} ${withSeconds(v.startTime, '00:00:00')}`);
    if (v.endDate) qs.set('end_date', `${v.endDate} ${withSeconds(v.endTime, '23:59:59')}`);
    try {
      const r = await api.get(`/history/${encodeURIComponent(s)}?${qs}`);
      setHistory(r.history);
      setPlot(null);
      return r.history;
    } catch (e) {
      alert(`Error fetching history: ${e.message}`);
      return null;
    }
  }

  // Opened from the Information table by clicking a callsign
  useEffect(() => { if (initialSender) search({ sender: initialSender }); }, []); // eslint-disable-line

  function setFilter(key, value) {
    const next = { [key]: value };
    setF((p) => ({ ...p, ...next }));
    if (sender.trim()) search(next);
  }

  async function plotTrail() {
    if (!sender.trim()) return alert('Please enter a sender ID to plot the trail.');
    const rows = await search();
    if (!rows) return;
    if (rows.length === 0) return alert('No journey recorded for this sender within the selected time range.');
    if (rows.length < 2) return alert('Not enough data points to plot a trail.');
    setPlot({ locations: rows });
  }

  return (
    <Modal open id="searchModal" className="fishermen-modal" title="Fishermen History" onClose={onClose}>
      <div className="div-box">
        <div className="div-box-sub">
          <div className="search-input">
            <input className="search" type="text" placeholder="Enter Sender ID..." value={sender}
              onChange={(e) => setSender(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()} />
            <img src="/assets/icons/search.png" alt="" width="15" height="15" />
          </div>
          <div className="button Plot-Btn">
            <button onClick={plotTrail}>Plot <img src="/assets/markers/plot-black.png" alt="" width="15" height="15" /></button>
          </div>
          <div className="button Clear-Btn">
            <button onClick={() => setPlot(null)}>Clear <img src="/assets/icons/eraser.png" alt="" width="25" height="25" /></button>
          </div>
        </div>

        <div className="filter-div">
          {[['From:', 'startDate', 'startTime'], ['To:', 'endDate', 'endTime']].map(([label, d, t]) => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'space-between', width: '100%' }}>
              <label className="input-label" style={{ color: '#DCDCDC' }}>{label}</label>
              <div className="filter-group">
                <input type="date" value={f[d]} onChange={(e) => setFilter(d, e.target.value)} />
                <input type="time" value={f[t]} onChange={(e) => setFilter(t, e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {plot ? (
        <HistoryMap plot={plot} />
      ) : (
        <div id="searchResultsWrapper">
          <div id="searchResults">
            {history && history.length === 0 && <p>No journey recorded for this sender within the selected time range.</p>}
            {(history || []).map((e, i) => (
              <div key={i}>
                <div className="message-item" onClick={() => setPlot({ point: e })}>
                  <strong className="highlight">{e.sender}</strong><br />
                  Time: {e.time_received}<br />
                  Location: (Latitude: {e.latitude}, Longitude: {e.longitude})<br />
                  Message: {e.message}<br />
                  Address: {e.place}<br />
                  Battery: {e.battery_percentage ?? 'N/A'}{e.battery_percentage != null && '%'}
                </div>
                <hr />
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
