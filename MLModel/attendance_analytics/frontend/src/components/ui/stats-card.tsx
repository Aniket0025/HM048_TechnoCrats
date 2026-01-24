import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { AnimatedCounter } from './animated-counter';

interface StatsCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'accent' | 'info';
  delay?: number;
}

const colorStyles = {
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    icon: 'text-primary',
  },
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    icon: 'text-success',
  },
  warning: {
    bg: 'bg-warning/10',
    text: 'text-warning',
    icon: 'text-warning',
  },
  destructive: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    icon: 'text-destructive',
  },
  accent: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    icon: 'text-accent',
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    icon: 'text-info',
  },
};

export function StatsCard({
  title,
  value,
  suffix,
  prefix,
  change,
  changeLabel,
  icon: Icon,
  color = 'primary',
  delay = 0,
}: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <motion.div
      className="stats-card group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-display tracking-tight">
            <AnimatedCounter value={value} suffix={suffix} prefix={prefix} />
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? 'text-success' : 'text-destructive'
                }`}
              >
                {change >= 0 ? '+' : ''}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <motion.div
          className={`rounded-xl p-3 ${styles.bg} transition-transform duration-300 group-hover:scale-110`}
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon className={`h-6 w-6 ${styles.icon}`} />
        </motion.div>
      </div>
      <Icon className={`stats-card-icon ${styles.icon}`} />
    </motion.div>
  );
}
