export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface LeadTimeOption {
  label: string;
  minutes: number;
}

export const PRESET_LEAD_TIMES: LeadTimeOption[] = [
  { label: 'At time of event', minutes: 0 },
  { label: '5 minutes before', minutes: 5 },
  { label: '10 minutes before', minutes: 10 },
  { label: '15 minutes before', minutes: 15 },
  { label: '30 minutes before', minutes: 30 },
  { label: '1 hour before', minutes: 60 },
  { label: '1 day before', minutes: 1440 },
  { label: '7 days before', minutes: 10080 }
];

export interface QuietHoursConfig {
  enabled: boolean;
  startTime: string; // HH:mm e.g. "22:00"
  endTime: string;   // HH:mm e.g. "07:00"
  mode: 'silent' | 'defer'; // silent = mute sound/vibration; defer = postpone to quiet hours end
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  defaultLeadTimes: number[]; // e.g. [0, 15]
  quietHours: QuietHoursConfig;
}
