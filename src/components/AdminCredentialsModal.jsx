import { useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Modal from './Modal.jsx';

export default function AdminCredentialsModal({ onClose }) {
  const { username, startAdmin } = useAuth();
  const [v, setV] = useState({ current: '', name: username, next: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((p) => ({ ...p, [k]: e.target.value }));

  async function submit() {
    if (!v.current || !v.name.trim() || !v.next) return setError('All fields are required.');
    if (v.next !== v.confirm) return setError('New password and confirmation do not match.');
    setBusy(true);
    setError('');
    try {
      const r = await api.post('/auth/credentials', { current_password: v.current, new_username: v.name.trim(), new_password: v.next });
      startAdmin(r.username, r.token);
      alert('Admin login details updated successfully.');
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to update admin credentials.');
      setBusy(false);
    }
  }

  return (
    <Modal open id="adminCredentialsModal" title="Admin Credentials" contentClass="auth-settings-modal-content" onClose={onClose}>
      <div className="auth-settings-panel">
        <div className="auth-field"><label>Current Admin Name</label><input type="text" value={username} readOnly /></div>
        <div className="auth-field"><label>Current Password</label>
          <input type="password" placeholder="Enter current password" value={v.current} onChange={set('current')} /></div>
        <div className="auth-field"><label>New Admin Name</label>
          <input type="text" placeholder="Enter new admin name" value={v.name} onChange={set('name')} /></div>
        <div className="auth-field"><label>New Password</label>
          <input type="password" placeholder="Enter new password" value={v.next} onChange={set('next')} /></div>
        <div className="auth-field"><label>Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" value={v.confirm} onChange={set('confirm')} /></div>
        <div className="auth-action-row">
          <button type="button" className="auth-login-btn secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="auth-login-btn" disabled={busy} onClick={submit}>Save Changes</button>
        </div>
        <p className="auth-error">{error}</p>
      </div>
    </Modal>
  );
}
