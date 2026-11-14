import { Priority } from './reminder.model';
import { QuietHoursConfig } from './notification.model';

export type AppTheme = 'light' | 'dark' | 'system';
export type CalendarType = 'BS' | 'AD';
export type WeekStartDay = 'sunday' | 'monday';
export type AppLanguage = 'en' | 'ne';

export interface AppSettings {
  theme: AppTheme;
  language: AppLanguage;
  nepaliNumerals: boolean;
  defaultCalendar: CalendarType;
  defaultPriority: Priority;
  weekStartDay: WeekStartDay;
  notificationsEnabled: boolean;
  notificationSound: boolean;
  notificationVibration: boolean;
  defaultLeadTime: number; // e.g. 15
  quietHours: QuietHoursConfig;
  autoSyncOnWifiOnly: boolean;
  googleClientId?: string;
  authorizedEmail?: string;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  lastSyncedAt?: string;
  backupFrequency?: 'daily' | 'weekly' | 'manual';
  lastBackupDate?: string;
}

export interface SettingRecord {
  key: string;
  value: unknown;
}
