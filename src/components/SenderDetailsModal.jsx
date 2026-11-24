import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { formatManila, parseLegacyDate } from '../utils';
import Modal from './Modal.jsx';

const EMPTY = { fromDate: '', fromTime: '', toDate: '', toTime: '', message: '' };

export default function SenderDetailsModal({ sender, month, onClose }) {
  const [details, setDetails] = useState([]);
  const [f, setF] = useState(EMPTY);

  useEffect(() => {
    api.get(`/history/${encodeURIComponent(sender)}/details?month=${encodeURIComponent(month)}`)
      .then((r) => setDetails(r.details))
      .catch((e) => alert(`Failed to fetch sender details: ${e.message}`));
  }, [sender, month]);

  const rows = useMemo(() => {
    const from = f.fromDate ? new Date(`${f.fromDate}T${f.fromTime || '00:00'}:00+08:00`) : null;
    const to = f.toDate ? new Date(`${f.toDate}T${f.toTime || '23:59'}:59+08:00`) : null;
    const needle = f.message.toLowerCase();
    return details
      .map((d) => ({ ...d, date: parseLegacyDate(d.time_received) }))
      .filter((d) => d.date && (!from || d.date >= from) && (!to || d.date <= to) && (!needle || d.message.toLowerCase().includes(needle)))
      .sort((a, b) => b.date - a.date);
  }, [details, f]);

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  return (
    <Modal open id="senderDetailsModal" title="Sender Message Details" onClose={onClose}>
      <div id="senderDetailsContent" className="sender-info">
        <p><strong>Sender:</strong> <span>{sender}</span></p>
        <div className="line2" />
        <p><strong>Month:</strong> <span>{month}</span></p>
        <div className="line2" />
        <p><strong>Messages: ({rows.length})</strong></p>
      </div>

      <div className="div-box">
        <div className="div-box-sub">
          <div className="search-input">
            <input className="search" type="text" placeholder="Filter by Message" value={f.message} onChange={set('message')} />
            <img src="/assets/icons/search.png" alt="" width="15" height="15" />
          </div>
          <div className="button clear">
            <button onClick={() => setF(EMPTY)}>Clear Filter <img src="/assets/icons/eraser.png" alt="" width="25" height="25" /></button>
          </div>
        </div>
        <div className="filter-div">
          <label style={{ color: '#DCDCDC' }}>From:</label>
          <div className="filter-group">
            <input type="date" value={f.fromDate} onChange={set('fromDate')} />
            <input type="time" value={f.fromTime} onChange={set('fromTime')} />
          </div>
          <label style={{ color: '#DCDCDC' }}>To:</label>
          <div className="filter-group">
            <input type="date" value={f.toDate} onChange={set('toDate')} />
            <input type="time" value={f.toTime} onChange={set('toTime')} />
          </div>
        </div>
      </div>

      <div id="tableWrapper">
        <table className="styled-table">
          <thead><tr><th>Date &amp; Time</th><th>Message</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="2">No matching records found.</td></tr>}
            {rows.map((d, i) => (
              <tr key={i}><td>{formatManila(d.date)}</td><td>{d.message}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
