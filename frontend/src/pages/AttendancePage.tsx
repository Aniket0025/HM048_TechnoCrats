import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Calendar, Download, Filter, Search, ChevronDown, Check, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceRecord {
  id: string;
  date: string;
  subject: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  time: string;
}

const mockAttendanceRecords: AttendanceRecord[] = [
  { id: '1', date: '2024-01-15', subject: 'Data Structures', status: 'present', markedBy: 'Dr. Emily Williams', time: '09:05 AM' },
  { id: '2', date: '2024-01-15', subject: 'Database Systems', status: 'present', markedBy: 'Prof. James Brown', time: '11:02 AM' },
  { id: '3', date: '2024-01-15', subject: 'Computer Networks', status: 'late', markedBy: 'Dr. Sarah Johnson', time: '02:12 PM' },
  { id: '4', date: '2024-01-14', subject: 'Data Structures', status: 'present', markedBy: 'Dr. Emily Williams', time: '09:00 AM' },
  { id: '5', date: '2024-01-14', subject: 'Software Engineering', status: 'absent', markedBy: 'Prof. Michael Chen', time: '-' },
  { id: '6', date: '2024-01-13', subject: 'Database Systems', status: 'present', markedBy: 'Prof. James Brown', time: '11:00 AM' },
  { id: '7', date: '2024-01-13', subject: 'Computer Networks', status: 'present', markedBy: 'Dr. Sarah Johnson', time: '02:00 PM' },
  { id: '8', date: '2024-01-12', subject: 'Data Structures', status: 'present', markedBy: 'Dr. Emily Williams', time: '09:03 AM' },
];

const subjectStats = [
  { subject: 'Data Structures', attended: 42, total: 45, percentage: 93 },
  { subject: 'Database Systems', attended: 38, total: 44, percentage: 86 },
  { subject: 'Computer Networks', attended: 35, total: 42, percentage: 83 },
  { subject: 'Software Engineering', attended: 30, total: 40, percentage: 75 },
  { subject: 'Operating Systems', attended: 28, total: 38, percentage: 74 },
];

const statusColors = {
  present: 'badge-success',
  absent: 'badge-danger',
  late: 'badge-warning',
};

const statusIcons = {
  present: Check,
  absent: X,
  late: Calendar,
};

export default function AttendancePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const filteredRecords = mockAttendanceRecords.filter((record) => {
    const matchesSearch = record.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || record.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const overallAttendance = 85;
  const presentCount = mockAttendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = mockAttendanceRecords.filter(r => r.status === 'absent').length;
  const lateCount = mockAttendanceRecords.filter(r => r.status === 'late').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Attendance"
        description="View and manage attendance records"
        icon={ClipboardCheck}
        actions={
          <Button className="bg-gradient-hero hover:opacity-90">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <motion.div
          className="md:col-span-1 glass-card p-6 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ProgressRing
            progress={overallAttendance}
            size={120}
            color={overallAttendance >= 75 ? 'success' : 'destructive'}
          />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Overall Attendance</p>
        </motion.div>

        <motion.div
          className="md:col-span-3 glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold font-display mb-4">Subject-wise Attendance</h3>
          <div className="space-y-4">
            {subjectStats.map((stat, index) => (
              <motion.div
                key={stat.subject}
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{stat.subject}</span>
                    <span className={`text-sm font-semibold ${
                      stat.percentage >= 85 ? 'text-success' :
                      stat.percentage >= 75 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        stat.percentage >= 85 ? 'bg-success' :
                        stat.percentage >= 75 ? 'bg-warning' : 'bg-destructive'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percentage}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {stat.attended}/{stat.total}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Present', count: presentCount, color: 'success', icon: Check },
          { label: 'Absent', count: absentCount, color: 'destructive', icon: X },
          { label: 'Late', count: lateCount, color: 'warning', icon: Calendar },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`rounded-xl bg-${stat.color}/10 p-4 flex items-center gap-4`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <div className={`rounded-lg p-2.5 bg-${stat.color}/20`}>
              <stat.icon className={`h-5 w-5 text-${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold font-display">{stat.count}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-12"
          />
        </div>
        <div className="relative">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="form-input appearance-none pr-10 min-w-[200px]"
          >
            <option value="all">All Subjects</option>
            {subjectStats.map((stat) => (
              <option key={stat.subject} value={stat.subject}>
                {stat.subject}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </motion.div>

      {/* Attendance Records Table */}
      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Time Marked</th>
                <th>Marked By</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record, index) => {
                const StatusIcon = statusIcons[record.status];
                return (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <td className="font-medium">{record.date}</td>
                    <td>{record.subject}</td>
                    <td>
                      <span className={statusColors[record.status]}>
                        <StatusIcon className="h-3 w-3 mr-1 inline" />
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{record.time}</td>
                    <td className="text-muted-foreground">{record.markedBy}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
