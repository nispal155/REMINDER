import { Injectable, inject, signal } from '@angular/core';
import { AppSettings, AppTheme, CalendarType, WeekStartDay, SoundChimeType } from '../../core/models/settings.model';
import { QuietHoursConfig } from '../../core/models/notification.model';
import { SettingsRepository } from '../../database/repositories/settings.repository';
import { ThemeService } from '../../core/services/theme.service';
import { ToastService } from '../../core/services/toast.service';
import { IndexedDbService } from '../../core/services/indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly settingsRepo = inject(SettingsRepository);
  private readonly themeService = inject(ThemeService);
  private readonly toast = inject(ToastService);
  private readonly indexedDbService = inject(IndexedDbService);

  readonly settings = signal<AppSettings>({
    theme: 'system',
    language: 'en',
    nepaliNumerals: false,
    defaultCalendar: 'BS',
    defaultPriority: 'medium',
    weekStartDay: 'sunday',
    notificationsEnabled: true,
    notificationSound: true,
    notificationVibration: true,
    defaultLeadTime: 15,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
      mode: 'silent'
    },
    autoSyncOnWifiOnly: true,
    autoSyncEnabled: true,
    syncIntervalMinutes: 15
  });

  constructor() {
    this.loadSettings();
  }

  async loadSettings(): Promise<void> {
    try {
      const theme = await this.settingsRepo.getSetting<AppTheme>('theme', 'system');
      const language = await this.settingsRepo.getSetting<'en' | 'ne'>('language', 'en');
      const nepaliNumerals = await this.settingsRepo.getSetting<boolean>('nepaliNumerals', false);
      const defaultCalendar = await this.settingsRepo.getSetting<CalendarType>('defaultCalendar', 'BS');
      const defaultPriority = await this.settingsRepo.getSetting<any>('defaultPriority', 'medium');
      const weekStartDay = await this.settingsRepo.getSetting<WeekStartDay>('weekStartDay', 'sunday');
      const notificationsEnabled = await this.settingsRepo.getSetting<boolean>('notificationsEnabled', true);
      const notificationSound = await this.settingsRepo.getSetting<boolean>('notificationSound', true);
      const soundChime = await this.settingsRepo.getSetting<SoundChimeType>('soundChime', 'temple');
      const notificationVibration = await this.settingsRepo.getSetting<boolean>('notificationVibration', true);
      const defaultLeadTime = await this.settingsRepo.getSetting<number>('defaultLeadTime', 15);
      const quietHours = await this.settingsRepo.getSetting<QuietHoursConfig>('quietHours', {
        enabled: false,
        startTime: '22:00',
        endTime: '07:00',
        mode: 'silent'
      });
      const autoSyncOnWifiOnly = await this.settingsRepo.getSetting<boolean>('autoSyncOnWifiOnly', true);
      const autoSyncEnabled = await this.settingsRepo.getSetting<boolean>('autoSyncEnabled', true);
      const lastBackupDate = await this.settingsRepo.getSetting<string | undefined>('lastBackupDate', undefined);

      this.settings.set({
        theme,
        language,
        nepaliNumerals,
        defaultCalendar,
        defaultPriority,
        weekStartDay,
        notificationsEnabled,
        notificationSound,
        soundChime,
        notificationVibration,
        defaultLeadTime,
        quietHours,
        autoSyncOnWifiOnly,
        autoSyncEnabled,
        syncIntervalMinutes: 15,
        lastBackupDate
      });
    } catch (e) {
      console.warn('Failed to load settings from DB:', e);
    }
  }

  async updateTheme(theme: AppTheme): Promise<void> {
    await this.themeService.setTheme(theme);
    this.settings.update(s => ({ ...s, theme }));
    this.toast.info(`Theme set to ${theme}`);
  }

  async updateDefaultCalendar(defaultCalendar: CalendarType): Promise<void> {
    await this.settingsRepo.setSetting('defaultCalendar', defaultCalendar);
    this.settings.update(s => ({ ...s, defaultCalendar }));
    this.toast.info(`Default calendar set to ${defaultCalendar}`);
  }

  async updateNotificationsEnabled(enabled: boolean): Promise<void> {
    await this.settingsRepo.setSetting('notificationsEnabled', enabled);
    this.settings.update(s => ({ ...s, notificationsEnabled: enabled }));
    this.toast.info(enabled ? 'Notifications enabled' : 'Notifications disabled');
  }

  async updateNotificationSound(sound: boolean): Promise<void> {
    await this.settingsRepo.setSetting('notificationSound', sound);
    this.settings.update(s => ({ ...s, notificationSound: sound }));
    this.toast.info(sound ? 'Notification sound enabled' : 'Notification sound muted');
  }

  async updateSoundChime(soundChime: SoundChimeType): Promise<void> {
    await this.settingsRepo.setSetting('soundChime', soundChime);
    this.settings.update(s => ({ ...s, soundChime }));
    this.toast.info(`Sound chime set to ${soundChime}`);
  }

  async updateNotificationVibration(vibration: boolean): Promise<void> {
    await this.settingsRepo.setSetting('notificationVibration', vibration);
    this.settings.update(s => ({ ...s, notificationVibration: vibration }));
    this.toast.info(vibration ? 'Notification vibration enabled' : 'Notification vibration disabled');
  }

  async updateQuietHours(quietHours: QuietHoursConfig): Promise<void> {
    await this.settingsRepo.setSetting('quietHours', quietHours);
    this.settings.update(s => ({ ...s, quietHours }));
    this.toast.info('Quiet hours updated');
  }

  async updateAutoSync(enabled: boolean): Promise<void> {
    await this.settingsRepo.setSetting('autoSyncEnabled', enabled);
    this.settings.update(s => ({ ...s, autoSyncEnabled: enabled }));
    this.toast.info(enabled ? 'Automatic cloud sync enabled' : 'Automatic cloud sync paused');
  }

  async seedDemoData(): Promise<void> {
    await this.indexedDbService.seedDemoData();
    this.toast.success('Sample demo data loaded successfully!');
  }

  async clearDatabase(): Promise<void> {
    await this.indexedDbService.clearAllData();
    this.toast.warning('All local data cleared');
  }
}
