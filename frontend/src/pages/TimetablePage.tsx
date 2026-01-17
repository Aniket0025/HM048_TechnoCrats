import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/contexts/AuthContext';

interface ClassSlot {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  color: string;
}

interface DaySchedule {
  day: string;
  slots: ClassSlot[];
}

const weekSchedule: DaySchedule[] = [
  {
    day: 'Monday',
    slots: [
      { id: '1', subject: 'Data Structures', teacher: 'Dr. Emily Williams', room: 'Room 301', startTime: '09:00', endTime: '10:00', color: 'bg-primary' },
      { id: '2', subject: 'Database Systems', teacher: 'Prof. James Brown', room: 'Lab 102', startTime: '11:00', endTime: '12:30', color: 'bg-accent' },
      { id: '3', subject: 'Computer Networks', teacher: 'Dr. Sarah Johnson', room: 'Room 205', startTime: '14:00', endTime: '15:00', color: 'bg-info' },
    ],
  },
  {
    day: 'Tuesday',
    slots: [
      { id: '4', subject: 'Software Engineering', teacher: 'Prof. Michael Chen', room: 'Room 401', startTime: '09:30', endTime: '11:00', color: 'bg-warning' },
      { id: '5', subject: 'Operating Systems', teacher: 'Dr. Alex Kumar', room: 'Room 302', startTime: '13:00', endTime: '14:30', color: 'bg-success' },
    ],
  },
  {
    day: 'Wednesday',
    slots: [
      { id: '6', subject: 'Data Structures Lab', teacher: 'Dr. Emily Williams', room: 'Lab 101', startTime: '09:00', endTime: '12:00', color: 'bg-primary' },
      { id: '7', subject: 'Computer Networks', teacher: 'Dr. Sarah Johnson', room: 'Room 205', startTime: '14:00', endTime: '15:00', color: 'bg-info' },
    ],
  },
  {
    day: 'Thursday',
    slots: [
      { id: '8', subject: 'Database Systems', teacher: 'Prof. James Brown', room: 'Room 201', startTime: '10:00', endTime: '11:00', color: 'bg-accent' },
      { id: '9', subject: 'Software Engineering', teacher: 'Prof. Michael Chen', room: 'Room 401', startTime: '13:30', endTime: '15:00', color: 'bg-warning' },
      { id: '10', subject: 'Operating Systems Lab', teacher: 'Dr. Alex Kumar', room: 'Lab 103', startTime: '15:30', endTime: '17:30', color: 'bg-success' },
    ],
  },
  {
    day: 'Friday',
    slots: [
      { id: '11', subject: 'Data Structures', teacher: 'Dr. Emily Williams', room: 'Room 301', startTime: '09:00', endTime: '10:00', color: 'bg-primary' },
      { id: '12', subject: 'Database Systems Lab', teacher: 'Prof. James Brown', room: 'Lab 102', startTime: '11:00', endTime: '13:00', color: 'bg-accent' },
    ],
  },
];

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function TimetablePage() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Timetable"
        description="View your weekly class schedule"
        icon={Calendar}
      />

      {/* Today's Classes */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-lg font-semibold font-display mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          Today's Classes ({today})
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {weekSchedule
            .find((d) => d.day === today)
            ?.slots.map((slot, index) => (
              <motion.div
                key={slot.id}
                className={`rounded-xl p-4 text-white ${slot.color}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                  <Clock className="h-4 w-4" />
                  {slot.startTime} - {slot.endTime}
                </div>
                <h4 className="font-semibold">{slot.subject}</h4>
                <div className="flex items-center gap-2 text-white/80 text-sm mt-2">
                  <MapPin className="h-4 w-4" />
                  {slot.room}
                </div>
                <p className="text-xs text-white/70 mt-1">{slot.teacher}</p>
              </motion.div>
            )) || (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No classes scheduled for today
            </p>
          )}
        </div>
      </motion.div>

      {/* Weekly Grid */}
      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold font-display">Weekly Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-6 border-b border-border">
              <div className="p-4 bg-muted/50">
                <span className="text-sm font-semibold text-muted-foreground">Time</span>
              </div>
              {weekSchedule.map((day) => (
                <div
                  key={day.day}
                  className={`p-4 text-center ${
                    day.day === today ? 'bg-primary/10' : 'bg-muted/50'
                  }`}
                >
                  <span className={`text-sm font-semibold ${
                    day.day === today ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {timeSlots.map((time, timeIndex) => (
              <motion.div
                key={time}
                className="grid grid-cols-6 border-b border-border last:border-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + timeIndex * 0.05 }}
              >
                <div className="p-4 text-sm text-muted-foreground font-medium">
                  {time}
                </div>
                {weekSchedule.map((day) => {
                  const slot = day.slots.find((s) => s.startTime === time);
                  return (
                    <div
                      key={`${day.day}-${time}`}
                      className={`p-2 min-h-[80px] ${day.day === today ? 'bg-primary/5' : ''}`}
                    >
                      {slot && (
                        <motion.div
                          className={`rounded-lg p-2 text-white text-xs h-full ${slot.color}`}
                          whileHover={{ scale: 1.02 }}
                        >
                          <p className="font-semibold truncate">{slot.subject}</p>
                          <p className="text-white/80 truncate">{slot.room}</p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
