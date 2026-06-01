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
    /** Timestamp (ms) de quando a próxima vida será regenerada, ou null */
    nextRegenAt: number | null;
  };
  loading: boolean;
  refreshProfile: () => Promise<void>;
  subtractLife: () => Promise<void>;
  clearSession: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);
const INITIAL_STATS = {
  streak: '0 dias',
  lives: '5/5',
  xp: '0',
  coins: '0',
  nextRegenAt: null as number | null
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setStats(INITIAL_STATS);
    setLoading(false);
  }, []);

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

        // Calcula quando a próxima vida será regenerada (10 min por vida)
        const currentLives = profile?.lives ?? 5;
        const MAX_LIVES = 5;
        const REGEN_MS = 10 * 60 * 1000;
        let nextRegenAt: number | null = null;
        if (!subscription && currentLives < MAX_LIVES && profile?.lastRegen) {
          nextRegenAt = new Date(profile.lastRegen).getTime() + REGEN_MS;
        }

        setStats({
          streak: `${profile?.streak || 0} dias`,
          lives: subscription ? '∞' : `${currentLives}/5`,
          xp: (wallet?.xp || 0).toString(),
          coins: (wallet?.coins || 0).toString(),
          nextRegenAt
        });
      }
    } catch (err: unknown) {
      const apiError = err as { status?: string | number; message?: string };
      const statusCode = Number(apiError?.status);
      const message = (apiError?.message || '').toLowerCase();
      const isUnauthenticated =
        statusCode === 401 ||
        message.includes('token de acesso não fornecido') ||
        message.includes('token inválido') ||
        message.includes('unauthorized');

      if (isUnauthenticated) {
        clearSession();
        return;
      }

      if (!isUnauthenticated) {
        console.error('Erro ao buscar perfil no Context:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    refreshProfile();
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
    subtractLife,
    clearSession
  }), [user, stats, loading, refreshProfile, subtractLife, clearSession]);

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
