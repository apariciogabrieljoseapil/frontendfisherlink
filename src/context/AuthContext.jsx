import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, TOKEN_KEY } from '../api';

const ROLE_KEY = 'fisherlink_role';
const NAME_KEY = 'fisherlink_admin_username';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // null | 'user' | 'admin'
  const [username, setUsername] = useState('');
  const [ready, setReady] = useState(false);

  const clear = useCallback(() => {
    setRole(null);
    setUsername('');
    [ROLE_KEY, TOKEN_KEY, NAME_KEY].forEach((k) => sessionStorage.removeItem(k));
  }, []);

  const startUser = useCallback(() => {
    sessionStorage.setItem(ROLE_KEY, 'user');
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(NAME_KEY);
    setRole('user');
    setUsername('');
  }, []);

  const startAdmin = useCallback((name, token) => {
    sessionStorage.setItem(ROLE_KEY, 'admin');
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(NAME_KEY, name);
    setRole('admin');
    setUsername(name);
  }, []);

  const logout = useCallback(async () => {
    if (sessionStorage.getItem(ROLE_KEY) === 'admin') {
      try { await api.post('/auth/logout'); } catch { /* ignore */ }
    }
    clear();
  }, [clear]);

  // Restore the saved session on first load
  useEffect(() => {
    (async () => {
      const saved = sessionStorage.getItem(ROLE_KEY);
      if (saved === 'user') {
        startUser();
      } else if (saved === 'admin' && sessionStorage.getItem(TOKEN_KEY)) {
        try {
          const s = await api.get('/auth/session');
          if (s.valid) startAdmin(s.username, sessionStorage.getItem(TOKEN_KEY));
          else clear();
        } catch {
          clear();
        }
      }
      setReady(true);
    })();
  }, [clear, startUser, startAdmin]);

  const value = useMemo(
    () => ({ role, username, ready, isAdmin: role === 'admin', startUser, startAdmin, logout }),
    [role, username, ready, startUser, startAdmin, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
