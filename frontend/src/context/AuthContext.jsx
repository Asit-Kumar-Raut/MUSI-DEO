import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('musideo_token');
    const storedUser = localStorage.getItem('musideo_user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    const userWithGuestFlag = { ...userData, isGuest: false };
    setUser(userWithGuestFlag);
    localStorage.setItem('musideo_token', token);
    localStorage.setItem('musideo_user', JSON.stringify(userWithGuestFlag));
  };

  const loginAsGuest = () => {
    const guestUser = { id: 'guest', username: 'Guest User', email: 'guest@musideo.local', isGuest: true };
    setUser(guestUser);
    localStorage.setItem('musideo_user', JSON.stringify(guestUser));
    // No token for guest
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('musideo_token');
    localStorage.removeItem('musideo_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsGuest, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
