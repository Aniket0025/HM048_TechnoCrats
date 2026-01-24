import { motion } from "framer-motion";
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    Building2,
    Eye,
    EyeOff,
    GraduationCap,
    Lock,
    Mail,
    Shield,
    User,
    Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { UserRole, roleDescriptions, roleIcons, roleLabels } from "@/types/auth";

const roles: UserRole[] = ["admin", "department", "teacher", "student"];

const features = [
  { icon: Shield, title: "Secure Access", description: "Role-based permissions & access control" },
  { icon: Users, title: "Multi-Role", description: "Admin, Department, Teacher & Student portals" },
  { icon: BookOpen, title: "Academics", description: "Attendance, timetable and feedback in one place" },
  { icon: BarChart3, title: "Analytics", description: "Real-time insights & reporting" },
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiresDepartment = selectedRole === "department" || selectedRole === "teacher";

  const validation = useMemo(() => {
    const nameOk = fullName.trim().length >= 2;
    const emailOk = isValidEmail(email.trim());
    const passwordOk = password.length >= 8;
    const confirmOk = confirmPassword.length > 0 && confirmPassword === password;
    const deptOk = !requiresDepartment || department.trim().length >= 2;

    const errors: string[] = [];
    if (!nameOk) errors.push("Enter your full name.");
    if (!emailOk) errors.push("Enter a valid email address.");
    if (!passwordOk) errors.push("Password must be at least 8 characters.");
    if (!confirmOk) errors.push("Passwords do not match.");
    if (!deptOk) errors.push("Enter your department.");
    if (!acceptedTerms) errors.push("Accept the terms to continue.");

    return {
      nameOk,
      emailOk,
      passwordOk,
      confirmOk,
      deptOk,
      canSubmit: errors.length === 0,
      errors,
    };
  }, [acceptedTerms, confirmPassword, department, email, fullName, password, requiresDepartment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.canSubmit) {
      toast({
        title: "Please fix the highlighted fields",
        description: validation.errors[0],
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await signup({
        name: fullName.trim(),
        email: email.trim(),
        password,
        role: selectedRole,
        department: requiresDepartment ? department.trim() : undefined,
      });
      toast({ title: "Account created" });
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast({
        title: "Sign up failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <motion.div
        className="hidden lg:flex lg:w-1/2 xl:w-[45%] flex-col justify-between bg-gradient-hero p-12 text-white relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>

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

        <motion.div
          className="relative z-10 space-y-6"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold font-display">Create your account</h2>
          <p className="text-lg text-white/80 max-w-md">
            Join the platform to manage academics, attendance, and insights in one secure place.
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

      <motion.div
        className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16 xl:px-24"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto w-full max-w-md">
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

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-3xl font-bold font-display text-foreground">Sign up</h2>
            <p className="mt-2 text-muted-foreground">Create an account to get started</p>
          </motion.div>

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
                      ? "border-primary bg-primary/5 shadow-glow"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                >
                  <span className="text-2xl">{roleIcons[role]}</span>
                  <p className="mt-2 font-semibold text-sm">{roleLabels[role]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{roleDescriptions[role]}</p>
                  {selectedRole === role && (
                    <motion.div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary" layoutId="signupRole">
                      <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div>
              <label className="form-label">Full name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className={`form-input pl-12 ${!validation.nameOk && fullName.length > 0 ? "border-destructive" : ""}`}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className={`form-input pl-12 ${!validation.emailOk && email.length > 0 ? "border-destructive" : ""}`}
                />
              </div>
            </div>

            {requiresDepartment && (
              <div>
                <label className="form-label">Department</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className={`form-input pl-12 ${!validation.deptOk && department.length > 0 ? "border-destructive" : ""}`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className={`form-input pl-12 pr-12 ${!validation.passwordOk && password.length > 0 ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Use at least 8 characters.</p>
            </div>

            <div>
              <label className="form-label">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`form-input pl-12 pr-12 ${!validation.confirmOk && confirmPassword.length > 0 ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                checked={acceptedTerms}
                onCheckedChange={(v) => setAcceptedTerms(Boolean(v))}
                className="mt-1"
              />
              <div>
                <p className="text-sm text-foreground">I agree to the Terms and Privacy Policy</p>
                <p className="text-xs text-muted-foreground">By creating an account, you agree to comply with institutional policies.</p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-hero hover:opacity-90 transition-opacity font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-primary underline underline-offset-4 hover:text-primary/90"
              >
                Sign in
              </button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
