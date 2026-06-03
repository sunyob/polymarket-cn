'use client';

import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { User, UserData, FavoriteMarket } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  login: (user: User, userData: UserData, token: string) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  toggleFavorite: (market: any) => Promise<void>;
  isFavorite: (marketId: string) => boolean;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  userData: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  refreshUserData: async () => {},
  toggleFavorite: async () => {},
  isFavorite: () => false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('user');
    const savedUserData = localStorage.getItem('userData');
    if (savedUser && savedUserData) {
      try {
        setUser(JSON.parse(savedUser));
        setUserData(JSON.parse(savedUserData));
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
      }
    }
  }, []);

  const login = useCallback((newUser: User, newUserData: UserData, token: string) => {
    setUser(newUser);
    setUserData(newUserData);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('userData', JSON.stringify(newUserData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setUserData(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
  }, []);

  const refreshUserData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/user?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setUserData(data.data);
        localStorage.setItem('userData', JSON.stringify(data.data));
      }
    } catch (err) {
      console.error('刷新用户数据失败:', err);
    }
  }, [user?.id]);

  const toggleFavorite = useCallback(async (market: any) => {
    if (!user?.id) return;

    try {
      const isFav = userData?.favorites?.find(f => f.id === market.id);
      
      const url = isFav 
        ? `/api/favorites?userId=${user.id}&marketId=${market.id}`
        : '/api/favorites';
      
      const res = await fetch(url, {
        method: isFav ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: isFav ? undefined : JSON.stringify({ userId: user.id, market }),
      });

      const data = await res.json();
      if (data.success) {
        await refreshUserData();
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
    }
  }, [user?.id, userData?.favorites, refreshUserData]);

  const isFavorite = useCallback((marketId: string) => {
    return userData?.favorites?.some(f => f.id === marketId) || false;
  }, [userData?.favorites]);

  const contextValue: AuthContextType = {
    user,
    userData,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUserData,
    toggleFavorite,
    isFavorite,
  };

  return (
    <AuthContext.Provider value={mounted ? contextValue : defaultAuthContext}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return defaultAuthContext;
  }
  return context;
}
