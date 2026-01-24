import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Users, GraduationCap, ClipboardCheck, MessageSquare, Download } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/ui/stats-card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const attendanceData = [
  { month: 'Aug', attendance: 92 },
  { month: 'Sep', attendance: 88 },
  { month: 'Oct', attendance: 85 },
  { month: 'Nov', attendance: 90 },
  { month: 'Dec', attendance: 87 },
  { month: 'Jan', attendance: 89 },
];

const departmentData = [
  { name: 'Computer Science', students: 450, attendance: 88 },
  { name: 'Electronics', students: 380, attendance: 85 },
  { name: 'Mechanical', students: 420, attendance: 82 },
  { name: 'Civil', students: 350, attendance: 86 },
  { name: 'Electrical', students: 310, attendance: 84 },
];

const feedbackDistribution = [
  { name: 'Excellent', value: 35, color: '#10b981' },
  { name: 'Good', value: 40, color: '#3b82f6' },
  { name: 'Average', value: 18, color: '#f59e0b' },
  { name: 'Poor', value: 7, color: '#ef4444' },
];

const stats = [
  { title: 'Total Students', value: 2847, change: 12, icon: GraduationCap, color: 'primary' as const },
  { title: 'Avg Attendance', value: 87, suffix: '%', change: 3, icon: ClipboardCheck, color: 'success' as const },
  { title: 'Feedback Score', value: 4.2, suffix: '/5', change: 8, icon: MessageSquare, color: 'accent' as const },
  { title: 'Active Teachers', value: 156, change: 5, icon: Users, color: 'info' as const },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Institution-wide insights and reports"
        icon={BarChart3}
        actions={
          <Button className="bg-gradient-hero hover:opacity-90">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attendance Trend */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold font-display">Attendance Trend</h3>
            <div className="flex items-center gap-1 text-sm text-success">
              <TrendingUp className="h-4 w-4" />
              <span>+3.2%</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[70, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Feedback Distribution */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold font-display mb-6">Feedback Distribution</h3>
          <div className="flex items-center justify-center">
            <div className="h-64 w-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feedbackDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {feedbackDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 ml-6">
              {feedbackDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-semibold ml-2">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Department Performance */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold font-display mb-6">Department Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="attendance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Low Attendance Departments */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-semibold font-display mb-4">Attention Required</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { dept: 'Mechanical Engineering', issue: 'Low attendance (82%)', severity: 'warning' },
            { dept: 'Physics Department', issue: 'Pending feedback (15%)', severity: 'warning' },
            { dept: 'Chemistry Lab', issue: 'Equipment shortage', severity: 'destructive' },
          ].map((item, index) => (
            <motion.div
              key={item.dept}
              className={`rounded-xl border-l-4 p-4 ${
                item.severity === 'destructive'
                  ? 'border-l-destructive bg-destructive/5'
                  : 'border-l-warning bg-warning/5'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <h4 className="font-semibold">{item.dept}</h4>
              <p className="text-sm text-muted-foreground mt-1">{item.issue}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
