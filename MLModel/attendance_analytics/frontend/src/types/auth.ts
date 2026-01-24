export type UserRole = 'admin' | 'department' | 'teacher' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'College Admin',
  department: 'Department Admin',
  teacher: 'Teacher',
  student: 'Student',
};

export const roleDescriptions: Record<UserRole, string> = {
  admin: 'Full ERP control across the institution',
  department: 'Manage department students & teachers',
  teacher: 'Mark attendance and manage classes',
  student: 'View attendance and submit feedback',
};

export const roleIcons: Record<UserRole, string> = {
  admin: '🏛️',
  department: '🏢',
  teacher: '👨‍🏫',
  student: '🎓',
};
