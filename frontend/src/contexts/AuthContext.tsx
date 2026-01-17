import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for different roles
const demoUsers: Record<UserRole, User> = {
  admin: {
    id: '1',
    email: 'admin@college.edu',
    name: 'Dr. Sarah Johnson',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  department: {
    id: '2',
    email: 'dept@college.edu',
    name: 'Prof. Michael Chen',
    role: 'department',
    department: 'Computer Science',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  },
  teacher: {
    id: '3',
    email: 'teacher@college.edu',
    name: 'Dr. Emily Williams',
    role: 'teacher',
    department: 'Computer Science',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
  },
  student: {
    id: '4',
    email: 'student@college.edu',
    name: 'Alex Thompson',
    role: 'student',
    department: 'Computer Science',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (email: string, password: string, role: UserRole) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = demoUsers[role];
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const user = demoUsers[role];
    setState(prev => ({
      ...prev,
      user,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
