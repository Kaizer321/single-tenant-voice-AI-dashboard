import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, pass: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userEmail: null,
  login: async () => ({}),
  logout: async () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('demo_auth_active') === 'true';
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem('demo_auth_email') || 'admin@apexplumbing.com';
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);
        } else {
          setIsAuthenticated(false);
          setUserEmail(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Mock session mode
      const savedAuth = localStorage.getItem('demo_auth_active') === 'true';
      setIsAuthenticated(savedAuth);
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) return { error: error.message };
      return {};
    } else {
      // Single admin demo credentials acceptance
      if (email && pass.length >= 4) {
        localStorage.setItem('demo_auth_active', 'true');
        localStorage.setItem('demo_auth_email', email);
        setIsAuthenticated(true);
        setUserEmail(email);
        return {};
      }
      return { error: 'Please enter a valid email and password' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('demo_auth_active');
    localStorage.removeItem('demo_auth_email');
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
