import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, Shield, Users, BookOpen, BarChart3, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, roleLabels, roleDescriptions, roleIcons } from '@/types/auth';
import { Button } from '@/components/ui/button';

const roles: UserRole[] = ['admin', 'department', 'teacher', 'student'];

const features = [
  { icon: Shield, title: 'Secure Access', description: 'Role-based permissions & JWT authentication' },
  { icon: Users, title: 'Multi-Role', description: 'Admin, Department, Teacher & Student portals' },
  { icon: BookOpen, title: 'Academics', description: 'Complete academic record management' },
  { icon: BarChart3, title: 'Analytics', description: 'Real-time insights & reporting' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password, selectedRole);
    navigate('/dashboard');
  };

  const handleDemoLogin = async (role: UserRole) => {
    setSelectedRole(role);
    await login(`${role}@college.edu`, 'demo123', role);
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 xl:w-[45%] flex-col justify-between bg-gradient-hero p-12 text-white relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

        {/* Logo & Title */}
        <div className="relative z-10">
          <motion.div
            className="flex items-center gap-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">EduSync</h1>
              <p className="text-sm text-white/80">College ERP System</p>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          className="relative z-10 space-y-6"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold font-display">
            Empowering Quality Education
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            A comprehensive digital platform for attendance tracking, academic management, and institutional analytics aligned with SDG 4.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <feature.icon className="h-6 w-6 mb-2" />
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-xs text-white/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="relative z-10 flex items-center gap-2 text-sm text-white/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            🎯
          </div>
          <span>Aligned with UN SDG 4: Quality Education</span>
        </motion.div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div
        className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16 xl:px-24"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div
            className="mb-8 flex items-center gap-3 lg:hidden"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-hero">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">EduSync</h1>
              <p className="text-xs text-muted-foreground">College ERP</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold font-display text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sign in to access your dashboard
            </p>
          </motion.div>

          {/* Role Selection */}
          <motion.div
            className="mt-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="form-label">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((role) => (
                <motion.button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                    selectedRole === role
                      ? 'border-primary bg-primary/5 shadow-glow'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl">{roleIcons[role]}</span>
                  <p className="mt-2 font-semibold text-sm">{roleLabels[role]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {roleDescriptions[role]}
                  </p>
                  {selectedRole === role && (
                    <motion.div
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary"
                      layoutId="roleIndicator"
                    >
                      <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`${selectedRole}@college.edu`}
                  className="form-input pl-12"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-hero hover:opacity-90 transition-opacity font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </motion.form>

          {/* Quick Demo Access */}
          <motion.div
            className="mt-8 rounded-xl border border-dashed border-border p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-center text-sm font-medium text-muted-foreground mb-3">
              Quick Demo Access
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {roles.map((role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin(role)}
                  className="text-xs"
                  disabled={isLoading}
                >
                  {roleIcons[role]} {roleLabels[role]}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
