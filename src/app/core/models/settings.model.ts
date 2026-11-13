import { Priority } from './reminder.model';
import { QuietHoursConfig } from './notification.model';

export type AppTheme = 'light' | 'dark' | 'system';
export type CalendarType = 'BS' | 'AD';
export type WeekStartDay = 'sunday' | 'monday';

export interface AppSettings {
  theme: AppTheme;
  defaultCalendar: CalendarType;
  defaultPriority: Priority;
  weekStartDay: WeekStartDay;
  notificationsEnabled: boolean;
  notificationSound: boolean;
  notificationVibration: boolean;
  defaultLeadTime: number; // e.g. 15
  quietHours: QuietHoursConfig;
  autoSyncOnWifiOnly: boolean;
  lastBackupDate?: string;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}
