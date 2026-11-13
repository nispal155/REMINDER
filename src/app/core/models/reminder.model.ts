export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ReminderStatus = 'pending' | 'completed' | 'dismissed' | 'snoozed';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface RepeatConfig {
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endAfterOccurrences?: number;
  endDateAD?: string;
}

export interface NotificationSchedule {
  remindAtTime: boolean;
  minutesBefore: number[]; // e.g. [0, 15, 60]
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateBS: string; // YYYY-MM-DD
  dateAD: string; // YYYY-MM-DD
  time: string;   // HH:mm (24h)
  timezone: string;
  priority: Priority;
  category: string;
  repeatType: RepeatType;
  repeatConfig?: RepeatConfig;
  notificationSchedule: NotificationSchedule;
  status: ReminderStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
