import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useToast } from '../hooks/use-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Optionally verify token by fetching profile
      authAPI.getProfile()
        .then(response => {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      // Clear any existing session first
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      const response = await authAPI.login({ email, password });
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: 'Autentificare reușită!',
        description: `Bun venit, ${userData.name}!`,
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Eroare la autentificare';
      toast({
        title: 'Eroare',
        description: message,
        variant: 'destructive',
      });
      return { success: false, error: message };
    }
  };

  const register = async (data) => {
    try {
      const response = await authAPI.register(data);
      const { access_token, user: userData } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      toast({
        title: 'Cont creat cu succes!',
        description: `Bun venit, ${userData.name}!`,
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Eroare la înregistrare';
      toast({
        title: 'Eroare',
        description: message,
        variant: 'destructive',
      });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: 'Deconectat',
      description: 'Ai fost deconectat cu succes.',
    });
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      toast({
        title: 'Profil actualizat!',
        description: 'Profilul tău a fost actualizat cu succes.',
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Eroare la actualizare';
      toast({
        title: 'Eroare',
        description: message,
        variant: 'destructive',
      });
      return { success: false, error: message };
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
