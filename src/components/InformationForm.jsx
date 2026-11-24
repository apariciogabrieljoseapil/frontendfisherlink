import { useState } from 'react';
import Modal from './Modal.jsx';

const EMPTY = { _id: '', id: '', name: '', callsign: '', address: '', phone_number: '', boat_color: '', engine_type: '', boat_length: '' };

export default function InformationForm({ record, existing, onSave, onClose }) {
  const [v, setV] = useState({ ...EMPTY, ...record });
  const [saving, setSaving] = useState(false);
  const editing = Boolean(record?._id);
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));

  async function submit() {
    const callsign = v.callsign.trim().toUpperCase();
    if (!v.name.trim() || !callsign || !v.address.trim()) return alert('Name, callsign, and address are required.');
    if (existing.some((r) => r._id !== v._id && String(r.callsign || '').toUpperCase() === callsign)) {
      return alert('This callsign is already assigned to another fisherman. Please use a unique callsign.');
    }
    setSaving(true);
    try {
      await onSave({ ...v, callsign });
    } catch (e) {
      alert(`Failed to save information: ${e.message}`);
      setSaving(false);
    }
  }

  const field = (label, key, props = {}, wide = false) => (
    <div className={`info-field${wide ? ' info-field-wide' : ''}`}>
      <label htmlFor={`info-${key}`}>{label}</label>
      <input id={`info-${key}`} value={v[key] ?? ''} onChange={set(key)} {...props} />
    </div>
  );

  return (
    <Modal open id="informationFormModal" title={editing ? 'Edit Fisherman' : 'Add Fisherman'} contentClass="info-form-modal-content" onClose={onClose}>
      <div className="info-form-panel">
        <div className="info-form-intro">
          <h3>Fisherman Information</h3>
          <p>Fill in the fisherman details below before saving the record.</p>
        </div>
        <div className="info-form-section">
          <h4>Personal Information</h4>
          <div className="info-form-grid">
            {field('Fisherman ID', 'id', { type: 'number', placeholder: 'Enter ID number' })}
            {field('Full Name', 'name', { type: 'text', placeholder: 'Enter full name' }, true)}
            {field('Callsign', 'callsign', { type: 'text', placeholder: 'Enter callsign' })}
          </div>
        </div>
        <div className="info-form-section">
          <h4>Contact Details</h4>
          <div className="info-form-grid">
            {field('Phone Number', 'phone_number', { type: 'text', placeholder: '09XX-XXX-XXXX' }, true)}
            {field('Address', 'address', { type: 'text', placeholder: 'Enter complete address' }, true)}
          </div>
        </div>
        <div className="info-form-section">
          <h4>Boat Details</h4>
          <div className="info-form-grid">
            {field('Boat Color', 'boat_color', { type: 'text', placeholder: 'Enter boat color' })}
            {field('Engine Type', 'engine_type', { type: 'text', placeholder: 'Enter engine type' })}
            {field('Boat Length', 'boat_length', { type: 'number', step: '0.1', placeholder: 'Length in meters' })}
          </div>
        </div>
        <div className="info-form-actions">
          <button className="info-admin-btn" disabled={saving} onClick={submit}>Save</button>
          <button className="info-admin-btn secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}
