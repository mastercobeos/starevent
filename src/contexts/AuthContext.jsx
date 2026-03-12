'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          document.cookie = 'has_admin_session=1; path=/admin; SameSite=Lax; max-age=86400';
        }
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        // Set/remove lightweight cookie so proxy can gate admin pages
        if (session?.user) {
          document.cookie = 'has_admin_session=1; path=/admin; SameSite=Lax; max-age=86400';
        } else {
          document.cookie = 'has_admin_session=; path=/admin; max-age=0';
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!supabase) {
      return { error: { message: 'Authentication service is not available' } };
    }
    try {
      return await supabase.auth.signInWithPassword({ email, password });
    } catch (err) {
      return { error: { message: err.message || 'Sign in failed' } };
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    document.cookie = 'has_admin_session=; path=/admin; max-age=0';
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
