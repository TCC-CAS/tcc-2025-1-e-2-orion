'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '@/services/api';

interface UserContextType {
  user: {
    name: string;
    avatarUrl: string | null;
    isPremium: boolean;
  } | null;
  stats: {
    streak: string;
    lives: string;
    xp: string;
    coins: string;
  };
  loading: boolean;
  refreshProfile: () => Promise<void>;
  subtractLife: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    streak: '0 dias',
    lives: '5/5',
    xp: '0',
    coins: '0'
  });
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get('/account/profile');
      if (res.status === 'OK' && res.data) {
        const { profile, wallet, name, subscription } = res.data;
        setUser({ 
          name, 
          avatarUrl: profile?.avatarUrl || null,
          isPremium: !!subscription 
        });
        setStats({
          streak: `${profile?.streak || 0} dias`,
          lives: subscription ? '∞' : `${profile?.lives ?? 5}/5`,
          xp: (wallet?.xp || 0).toString(),
          coins: (wallet?.coins || 0).toString()
        });
      }
    } catch (err) {
      console.error('Erro ao buscar perfil no Context:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      // Only refresh if we don't have user data yet or if explicitly requested
      refreshProfile();
    } else {
      setLoading(false);
    }
  }, [refreshProfile]);

  const subtractLife = useCallback(async () => {
    try {
      const res = await api.post('/account/subtract-life', {});
      if (res.status === 'OK') {
        await refreshProfile();
      }
    } catch (err) {
      console.error('Erro ao subtrair vida:', err);
    }
  }, [refreshProfile]);

  const value = useMemo(() => ({
    user,
    stats,
    loading,
    refreshProfile,
    subtractLife
  }), [user, stats, loading, refreshProfile, subtractLife]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
