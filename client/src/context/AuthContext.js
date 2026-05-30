import React, { createContext, useState, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken]       = useState(localStorage.getItem('token'));
  const [identity, setIdentity] = useState(null);
  const [loading, setLoading]   = useState(false);

  const login = useCallback(async (publicKeyHash) => {
    setLoading(true);
    try {
      const { data } = await api.post('/identity/authenticate', { publicKeyHash });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setIdentity(data.identity);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Authentication failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (publicKeyHash, anonymousHandle) => {
    setLoading(true);
    try {
      const { data } = await api.post('/identity/register', { publicKeyHash, anonymousHandle });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setIdentity(data.identity);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setIdentity(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, identity, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
