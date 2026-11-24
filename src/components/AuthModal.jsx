import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthModal() {
  const { startUser, startAdmin } = useAuth();
  const [mode, setMode] = useState('choice'); // 'choice' | 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/auth/mode')
      .then((r) => setUsername((u) => u || r.defaultAdminUsername || ''))
      .catch(() => {});
  }, []);

  async function login() {
    if (!username.trim() || !password) return setError('Admin name and password are required.');
    setBusy(true);
    setError('');
    try {
      const r = await api.post('/auth/login', { username: username.trim(), password });
      startAdmin(r.username, r.token); // modal unmounts once role is set
    } catch (e) {
      setError(e.message || 'Admin login failed.');
      setBusy(false);
    }
  }

  return (
    <div id="authModal" className="auth-modal" style={{ display: 'flex' }}>
      <div className="auth-modal-content">
        <img src="/assets/logos/fisherlink.png" alt="FisherLink" className="auth-logo" />
        <h2>FisherLink Access</h2>
        <p className="auth-subtitle">
          {mode === 'choice' ? 'Choose how you want to continue.' : 'Sign in as admin to manage data and responses.'}
        </p>

        {mode === 'choice' ? (
          <div className="auth-choice-panel">
            <button type="button" className="auth-login-btn" onClick={startUser}>Continue as User</button>
            <button type="button" className="auth-login-btn secondary" onClick={() => { setError(''); setMode('admin'); }}>
              Admin Login
            </button>
          </div>
        ) : (
          <div className="auth-admin-panel">
            <div className="auth-field">
              <label htmlFor="adminUsername">Admin Name</label>
              <input id="adminUsername" type="text" placeholder="Enter admin name" value={username}
                onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="auth-field">
              <label htmlFor="adminPassword">Password</label>
              <input id="adminPassword" type="password" placeholder="Enter password" value={password} autoFocus
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && login()} />
            </div>
            <div className="auth-action-row">
              <button type="button" className="auth-login-btn secondary" onClick={() => { setError(''); setPassword(''); setMode('choice'); }}>Back</button>
              <button type="button" className="auth-login-btn" disabled={busy} onClick={login}>Login</button>
            </div>
          </div>
        )}
        <p className="auth-error">{error}</p>
      </div>
    </div>
  );
}
