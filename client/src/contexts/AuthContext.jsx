import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid token:", error);
        setToken(null);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const res = await api.post('/api/auth/login', { username, password });
      const newToken = res.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      const decoded = jwtDecode(newToken);
      setUser(decoded);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const res = await api.post('/api/auth/signup', { username, email, password });
      const newToken = res.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      const decoded = jwtDecode(newToken);
      setUser(decoded);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, loading, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
