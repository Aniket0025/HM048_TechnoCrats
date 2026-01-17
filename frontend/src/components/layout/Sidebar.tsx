import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Building2,
  BarChart3,
  QrCode,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, roleLabels } from '@/types/auth';

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'department', 'teacher', 'student'] },
  { label: 'Departments', icon: Building2, path: '/departments', roles: ['admin'] },
  { label: 'Teachers', icon: Users, path: '/teachers', roles: ['admin', 'department'] },
  { label: 'Students', icon: GraduationCap, path: '/students', roles: ['admin', 'department', 'teacher'] },
  { label: 'Subjects', icon: BookOpen, path: '/subjects', roles: ['admin', 'department', 'teacher'] },
  { label: 'Timetable', icon: Calendar, path: '/timetable', roles: ['admin', 'department', 'teacher', 'student'] },
  { label: 'Attendance', icon: ClipboardCheck, path: '/attendance', roles: ['admin', 'department', 'teacher', 'student'] },
  { label: 'QR Attendance', icon: QrCode, path: '/qr-attendance', roles: ['teacher', 'student'] },
  { label: 'Academic Records', icon: FileText, path: '/academics', roles: ['admin', 'department', 'teacher', 'student'] },
  { label: 'Feedback', icon: MessageSquare, path: '/feedback', roles: ['admin', 'department', 'teacher', 'student'] },
  { label: 'Analytics', icon: BarChart3, path: '/analytics', roles: ['admin', 'department'] },
  { label: 'Notifications', icon: Bell, path: '/notifications', roles: ['admin', 'department', 'teacher', 'student'] },
  { label: 'Settings', icon: Settings, path: '/settings', roles: ['admin', 'department', 'teacher', 'student'] },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 },
  };

  return (
    <motion.aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar border-r border-sidebar-border"
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold font-display text-sidebar-foreground">
                  EduSync
                </h1>
                <p className="text-xs text-sidebar-foreground/60">College ERP</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* User Info */}
      {user && (
        <div className="border-b border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-10 w-10 rounded-full ring-2 ring-sidebar-accent"
            />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="truncate text-sm font-semibold text-sidebar-foreground">
                    {user.name}
                  </p>
                  <p className="text-xs text-sidebar-primary">
                    {roleLabels[user.role]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                >
                  <Icon size={20} />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-sidebar-primary"
                      layoutId="activeIndicator"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={logout}
          className="sidebar-link w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={20} />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
