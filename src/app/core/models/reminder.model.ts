export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ReminderStatus = 'pending' | 'completed' | 'dismissed' | 'snoozed';
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly_ad' | 'yearly_bs' | 'custom';
export type CalendarInputMode = 'AD' | 'BS';

export const REMINDER_CATEGORIES = [
  'Personal',
  'Work',
  'Study',
  'Birthday',
  'Payment',
  'Bill',
  'Health',
  'Meeting',
  'Travel',
  'Other'
] as const;

export type ReminderCategory = typeof REMINDER_CATEGORIES[number];

export type SnoozeDuration =
  | '5m'
  | '10m'
  | '15m'
  | '30m'
  | '1h'
  | '3h'
  | 'tomorrow'
  | 'custom';

export interface RepeatConfig {
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  bsMonth?: number;
  bsDay?: number;
  endAfterOccurrences?: number;
  endDateAD?: string;
}

export interface NotificationSchedule {
  remindAtTime: boolean;
  minutesBefore: number[]; // e.g. [0, 15, 60]
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  calendarMode?: CalendarInputMode;
  dateBS: string; // YYYY-MM-DD
  dateAD: string; // YYYY-MM-DD
  time: string;   // HH:mm (24h)
  timezone: string;
  priority: Priority;
  category: ReminderCategory | string;
  repeatType: RepeatType;
  repeatConfig?: RepeatConfig;
  notificationSchedule: NotificationSchedule;
  attachmentIds?: string[];
  subtasks?: Subtask[];
  tags?: string[];
  amount?: number;
  currency?: string;
  isPaid?: boolean;
  status: ReminderStatus;
  snoozedUntil?: string; // ISO datetime
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
