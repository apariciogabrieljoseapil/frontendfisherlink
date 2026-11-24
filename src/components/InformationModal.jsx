import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import Modal from './Modal.jsx';
import InformationForm from './InformationForm.jsx';

export default function InformationModal({ isAdmin, onClose, onOpenHistory, onChanged }) {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [address, setAddress] = useState('');
  const [form, setForm] = useState(null); // null | {} (add) | record (edit)

  const load = useCallback(() =>
    
 api.get('/information')
    .then((r) => setRows(r.info.map((x) => ({ ...x, _id: x._id ?? x.id }))))
    .catch((e) => alert(`Failed to load information: ${e.message}`)), []);
  useEffect(() => { load(); }, [load]);

  const addresses = useMemo(() => [...new Set(rows.map((r) => r.address).filter(Boolean))], [rows]);
  const visible = useMemo(() => {
    const needle = q.toLowerCase();
    return rows.filter((r) =>
      (!address || r.address === address) &&
      [r.id, r.name, r.callsign, r.address, r.phone_number, r.boat_color, r.engine_type, r.boat_length]
        .join(' ').toLowerCase().includes(needle));
  }, [rows, q, address]);

  async function save(rec) {
    const { _id, ...body } = rec;
    if (_id) await api.put(`/information/${_id}`, body);
    else await api.post('/information', body);
    setForm(null);
    await load();
    onChanged(); // refresh the map
  }

  async function remove(id) {
    if (!confirm('Delete this fisherman record?')) return;
    try {
      await api.del(`/information/${id}`);
      await load();
      onChanged();
    } catch (e) {
      alert(`Failed to delete information: ${e.message}`);
    }
  }

  return (
    <>
      <Modal open id="detailsModal" title="Information Details" onClose={onClose}>
        <div className="count-div2">Fishermen Count: (<span id="infoFishermenCount">{visible.length}</span>)</div>

        <div className="div-box-sub info-controls-row">
          <div className="search-input">
            <input type="text" className="search" placeholder="Search name or callsign..." value={q} onChange={(e) => setQ(e.target.value)} />
            <img src="/assets/icons/search.png" alt="" width="15" height="15" />
          </div>
          <div className="filter-group">
            <select id="addressFilter" className="Adr" value={address} onChange={(e) => setAddress(e.target.value)}>
              <option value="">All Addresses</option>
              {addresses.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {isAdmin && (
            <div className="info-admin-toolbar">
              <button className="info-admin-btn" onClick={() => setForm({})}>Add Fisherman</button>
            </div>
          )}
        </div>

        <div className="scrollable-details-table">
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Callsign</th><th>Address</th><th>Phone Number</th>
                <th>Boat Color</th><th>Engine Type</th><th>Boat Length</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr><td colSpan={isAdmin ? 9 : 8} style={{ textAlign: 'center' }}>No matching data.</td></tr>
              )}
              {visible.map((r, i) => {
                const color = r.boat_color || 'Gray';
                return (
                  <tr key={r._id}>
                    <td>{i+ 1}</td>
                    <td>{r.name}</td>
                    <td className="clickable-callsign" onClick={() => onOpenHistory(r.callsign)}>{r.callsign}</td>
                    <td>{r.address}</td>
                    <td>{r.phone_number || ''}</td>
                    <td className="boat-color-cell">
                      <div className="color-box" style={{ backgroundColor: color.toLowerCase() }} />
                      {color}
                    </td>
                    <td>{r.engine_type || 'N/A'}</td>
                    <td>{r.boat_length ? `${r.boat_length} m` : 'N/A'}</td>
                    {isAdmin && (
                      <td>
                        <div className="info-row-actions">
                          <button className="edit-btn" onClick={() => setForm(r)}>Edit</button>
                          <button className="delete-btn" onClick={() => remove(r._id)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Modal>

      {form && <InformationForm record={form} existing={rows} onSave={save} onClose={() => setForm(null)} />}
    </>
  );
}
