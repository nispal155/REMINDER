import { Priority } from './reminder.model';

export type AppTheme = 'light' | 'dark' | 'system';
export type CalendarType = 'BS' | 'AD';
export type WeekStartDay = 'sunday' | 'monday';

export interface AppSettings {
  theme: AppTheme;
  defaultCalendar: CalendarType;
  defaultPriority: Priority;
  weekStartDay: WeekStartDay;
  notificationSound: boolean;
  autoSyncOnWifiOnly: boolean;
  lastBackupDate?: string;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}

