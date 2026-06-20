import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('gi_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const saveUser = (userData, token) => {
    setUser(userData);
    localStorage.setItem('gi_user', JSON.stringify(userData));
    if (token) localStorage.setItem('gi_token', token);
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem('gi_user');
    localStorage.removeItem('gi_token');
  };

  // Verify token on mount
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('gi_token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.user) {
            saveUser(res.user, null);
          }
        } catch {
          clearUser();
        }
      }
      setLoading(false);
      setInitialized(true);
    };
    init();
  }, []);

  const signup = useCallback(async (data) => {
    const res = await authService.signup(data);
    if (res.user) saveUser(res.user, res.token);
    return res;
  }, []);

  const login = useCallback(async (data) => {
    const res = await authService.login(data);
    if (res.user) saveUser(res.user, res.token);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch {}
    clearUser();
  }, []);

  const updateUserData = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('gi_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user, loading, initialized,
      isAuthenticated, isAdmin,
      signup, login, logout, updateUserData,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
