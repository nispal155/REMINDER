import { Injectable, inject, signal } from '@angular/core';
import { AppSettings, AppTheme, CalendarType, WeekStartDay } from '../../core/models/settings.model';
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
    defaultCalendar: 'BS',
    defaultPriority: 'medium',
    weekStartDay: 'sunday',
    notificationSound: true,
    autoSyncOnWifiOnly: true
  });

  constructor() {
    this.loadSettings();
  }

  async loadSettings(): Promise<void> {
    try {
      const theme = await this.settingsRepo.getSetting<AppTheme>('theme', 'system');
      const defaultCalendar = await this.settingsRepo.getSetting<CalendarType>('defaultCalendar', 'BS');
      const defaultPriority = await this.settingsRepo.getSetting<any>('defaultPriority', 'medium');
      const weekStartDay = await this.settingsRepo.getSetting<WeekStartDay>('weekStartDay', 'sunday');
      const notificationSound = await this.settingsRepo.getSetting<boolean>('notificationSound', true);
      const autoSyncOnWifiOnly = await this.settingsRepo.getSetting<boolean>('autoSyncOnWifiOnly', true);
      const lastBackupDate = await this.settingsRepo.getSetting<string | undefined>('lastBackupDate', undefined);

      this.settings.set({
        theme,
        defaultCalendar,
        defaultPriority,
        weekStartDay,
        notificationSound,
        autoSyncOnWifiOnly,
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

  async seedDemoData(): Promise<void> {
    await this.indexedDbService.seedDemoData();
    this.toast.success('Sample demo data loaded successfully!');
  }

  async clearDatabase(): Promise<void> {
    await this.indexedDbService.clearAllData();
    this.toast.warning('All local data cleared');
  }
}

