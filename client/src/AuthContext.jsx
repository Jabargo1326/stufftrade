import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  // On page load: if a token is saved, ask the server who we are.
  useEffect(() => {
    if (!getToken()) return;
    api.me().then((d) => setUser(d.user)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  // api.js fires this when the server says the token expired.
  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const signIn = useCallback((token, u) => { setToken(token); setUser(u); }, []);
  const signOut = useCallback(() => { setToken(null); setUser(null); }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signIn, signOut }}>{children}</AuthContext.Provider>
  );
}
