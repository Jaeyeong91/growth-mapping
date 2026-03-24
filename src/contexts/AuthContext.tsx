import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string) => User | null;
  logout: () => void;
  addUser: (user: User) => boolean;
  removeUser: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'gm_users';
const USERS_VERSION_KEY = 'gm_users_version';
const CURRENT_USER_KEY = 'gm_current_user';
const CURRENT_VERSION = '2';

function loadUsers(): User[] {
  const storedVersion = localStorage.getItem(USERS_VERSION_KEY);
  if (storedVersion === CURRENT_VERSION) {
    const stored = localStorage.getItem(USERS_KEY);
    if (stored) return JSON.parse(stored);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(USERS_VERSION_KEY, CURRENT_VERSION);
  localStorage.removeItem(CURRENT_USER_KEY);
  return INITIAL_USERS;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(loadUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  const login = (email: string): User | null => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) setCurrentUser(user);
    return user || null;
  };

  const logout = () => setCurrentUser(null);

  const addUser = (user: User): boolean => {
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) return false;
    setUsers(prev => [...prev, user]);
    return true;
  };

  const removeUser = (email: string): boolean => {
    if (email.toLowerCase() === 'jaeyeong@dcamp.kr') return false;
    setUsers(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
    return true;
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, logout, addUser, removeUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
