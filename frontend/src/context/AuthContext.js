import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refresh'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!accessToken);
  const API_URL = process.env.REACT_APP_API_URL;

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('access', accessToken);
    localStorage.setItem('refresh', refreshToken);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setAccessToken(null);
    setRefreshToken(null);
    setIsLoggedIn(false);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('access');
      setAccessToken(token);
      setIsLoggedIn(!!token);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshAccessToken = async () => {
    if (!refreshToken) return logout();
    try {
      const res = await fetch(`${API_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!res.ok) throw new Error('Refresh token failed');
      const data = await res.json();
      localStorage.setItem('access', data.access);
      setAccessToken(data.access);
      setIsLoggedIn(true);
      return data.access;
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, accessToken, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
