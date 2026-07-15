import { createContext, useContext, useState, useEffect } from 'react';

import { API } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('arogya_admin_token');
    const storedUser = localStorage.getItem('arogya_admin_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('arogya_admin_token');
        localStorage.removeItem('arogya_admin_user');
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed' };
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('arogya_admin_token', data.token);
      localStorage.setItem('arogya_admin_user', JSON.stringify(data.user));
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to server' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
      }
    } catch {}
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('arogya_admin_token');
    localStorage.removeItem('arogya_admin_user');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
