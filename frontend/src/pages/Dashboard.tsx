import { motion } from 'framer-motion';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/ui/stats-card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for dashboards
const adminStats = [
  { title: 'Total Students', value: 2847, change: 12, changeLabel: 'vs last year', icon: GraduationCap, color: 'primary' as const },
  { title: 'Total Teachers', value: 156, change: 8, changeLabel: 'vs last year', icon: Users, color: 'accent' as const },
  { title: 'Departments', value: 12, icon: Building2, color: 'info' as const },
  { title: 'Active Subjects', value: 248, change: 15, changeLabel: 'this semester', icon: BookOpen, color: 'success' as const },
];

const teacherStats = [
  { title: 'My Classes', value: 6, icon: BookOpen, color: 'primary' as const },
  { title: 'Total Students', value: 245, icon: GraduationCap, color: 'accent' as const },
  { title: 'Pending Marks', value: 12, icon: ClipboardCheck, color: 'warning' as const },
  { title: 'Avg Attendance', value: 87, suffix: '%', icon: TrendingUp, color: 'success' as const },
];

const studentStats = [
  { title: 'Enrolled Subjects', value: 8, icon: BookOpen, color: 'primary' as const },
  { title: 'Classes Today', value: 4, icon: Calendar, color: 'accent' as const },
  { title: 'Pending Feedback', value: 3, icon: MessageSquare, color: 'warning' as const },
  { title: 'Notifications', value: 5, icon: Bell, color: 'info' as const },
];

const recentActivities = [
  { id: 1, type: 'attendance', message: 'Attendance marked for CS301 - Data Structures', time: '2 mins ago', icon: ClipboardCheck },
  { id: 2, type: 'announcement', message: 'New notice: Mid-semester exams schedule released', time: '1 hour ago', icon: Bell },
  { id: 3, type: 'feedback', message: '15 new feedback submissions for semester courses', time: '3 hours ago', icon: MessageSquare },
  { id: 4, type: 'alert', message: '23 students below 75% attendance threshold', time: '5 hours ago', icon: AlertTriangle },
];

const upcomingClasses = [
  { id: 1, subject: 'Data Structures', time: '09:00 AM', room: 'Room 301', teacher: 'Dr. Emily Williams' },
  { id: 2, subject: 'Database Systems', time: '11:00 AM', room: 'Lab 102', teacher: 'Prof. James Brown' },
  { id: 3, subject: 'Computer Networks', time: '02:00 PM', room: 'Room 205', teacher: 'Dr. Sarah Johnson' },
  { id: 4, subject: 'Software Engineering', time: '04:00 PM', room: 'Room 401', teacher: 'Prof. Michael Chen' },
];

const attendanceData = [
  { subject: 'Data Structures', attended: 42, total: 45, percentage: 93 },
  { subject: 'Database Systems', attended: 38, total: 44, percentage: 86 },
  { subject: 'Computer Networks', attended: 35, total: 42, percentage: 83 },
  { subject: 'Software Engineering', attended: 30, total: 40, percentage: 75 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();

  const getStats = () => {
    switch (user?.role) {
      case 'admin':
      case 'department':
        return adminStats;
      case 'teacher':
        return teacherStats;
      case 'student':
        return studentStats;
      default:
        return [];
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}!`}
        description={`Here's what's happening in your ${user?.role === 'admin' ? 'institution' : user?.role === 'department' ? 'department' : 'classes'} today.`}
      />

      {/* Stats Grid */}
      <motion.div
        className="dashboard-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {stats.map((stat, index) => (
          <StatsCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <motion.div
          className="lg:col-span-2 glass-card p-6"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold font-display mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className={`rounded-lg p-2 ${
                  activity.type === 'alert' ? 'bg-warning/10 text-warning' :
                  activity.type === 'attendance' ? 'bg-success/10 text-success' :
                  activity.type === 'feedback' ? 'bg-accent/10 text-accent' :
                  'bg-primary/10 text-primary'
                }`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions / Attendance Summary */}
        <motion.div
          className="glass-card p-6"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          {user?.role === 'student' ? (
            <>
              <h3 className="text-lg font-semibold font-display mb-4">My Attendance</h3>
              <div className="flex justify-center mb-6">
                <ProgressRing progress={85} size={140} color="success" />
              </div>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Overall attendance this semester
              </p>
              <div className="space-y-3">
                {attendanceData.slice(0, 3).map((item) => (
                  <div key={item.subject} className="flex items-center justify-between">
                    <span className="text-sm truncate flex-1 mr-2">{item.subject}</span>
                    <span className={`text-sm font-semibold ${
                      item.percentage >= 85 ? 'text-success' :
                      item.percentage >= 75 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold font-display mb-4">Attendance Overview</h3>
              <div className="flex justify-center mb-6">
                <ProgressRing progress={87} size={140} color="accent" />
              </div>
              <p className="text-center text-sm text-muted-foreground mb-4">
                Average attendance rate
              </p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-success/10 p-3">
                  <p className="text-2xl font-bold text-success">2,480</p>
                  <p className="text-xs text-muted-foreground">Above 75%</p>
                </div>
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-2xl font-bold text-destructive">367</p>
                  <p className="text-xs text-muted-foreground">Below 75%</p>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Upcoming Classes / Schedule */}
      {(user?.role === 'student' || user?.role === 'teacher') && (
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold font-display mb-4">
            {user?.role === 'student' ? "Today's Classes" : "Today's Schedule"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcomingClasses.map((cls, index) => (
              <motion.div
                key={cls.id}
                className="rounded-xl border border-border p-4 hover:border-primary/30 hover:shadow-md transition-all"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center gap-2 text-primary mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-semibold">{cls.time}</span>
                </div>
                <h4 className="font-semibold">{cls.subject}</h4>
                <p className="text-sm text-muted-foreground">{cls.room}</p>
                <p className="text-xs text-muted-foreground mt-1">{cls.teacher}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Low Attendance Alert (Admin/Department/Teacher) */}
      {(user?.role === 'admin' || user?.role === 'department' || user?.role === 'teacher') && (
        <motion.div
          className="rounded-xl border-l-4 border-l-warning bg-warning/5 p-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Low Attendance Alert</h4>
              <p className="text-sm text-muted-foreground mt-1">
                23 students have attendance below 75% threshold. Review and take necessary action.
              </p>
              <button className="mt-2 text-sm font-medium text-warning hover:underline">
                View Details →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
