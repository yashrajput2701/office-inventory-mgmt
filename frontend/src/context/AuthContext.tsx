import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../api/client';
import type { CurrentUser, LoginResponse } from '../types';

interface AuthContextType {
  user: CurrentUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadStoredUser(): CurrentUser | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(loadStoredUser());

  const login = async (username: string, password: string) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', { username, password });
    const currentUser: CurrentUser = {
      userId: data.userId,
      username: data.username,
      fullName: data.fullName,
      role: data.role,
    };
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(currentUser));
    setUser(currentUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
