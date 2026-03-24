import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  login: (email: string) => Promise<User | null>;
  logout: () => void;
  addUser: (user: User) => Promise<boolean>;
  removeUser: (email: string) => Promise<boolean>;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const CURRENT_USER_KEY = 'gm_current_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at');
    if (!error && data) {
      const mapped: User[] = data.map(row => ({
        email: row.email,
        name: row.name,
        role: row.role,
        createdAt: row.created_at,
      }));
      setUsers(mapped);
    }
  }, []);

  useEffect(() => {
    refreshUsers().then(() => setLoading(false));
  }, [refreshUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const login = async (email: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();
    if (error || !data) return null;
    const user: User = {
      email: data.email,
      name: data.name,
      role: data.role,
      createdAt: data.created_at,
    };
    setCurrentUser(user);
    return user;
  };

  const logout = () => setCurrentUser(null);

  const addUser = async (user: User): Promise<boolean> => {
    const { error } = await supabase
      .from('users')
      .insert({ email: user.email, name: user.name, role: user.role });
    if (error) return false;
    await refreshUsers();
    return true;
  };

  const removeUser = async (email: string): Promise<boolean> => {
    if (email.toLowerCase() === 'jaeyeong@dcamp.kr') return false;
    const { error } = await supabase
      .from('users')
      .delete()
      .ilike('email', email);
    if (error) return false;
    await refreshUsers();
    return true;
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, loading, login, logout, addUser, removeUser, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
