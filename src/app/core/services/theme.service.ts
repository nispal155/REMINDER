import { Injectable, signal, effect, inject } from '@angular/core';
import { AppTheme } from '../models/settings.model';
import { SettingsRepository } from '../../database/repositories/settings.repository';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly settingsRepo = inject(SettingsRepository);

  readonly currentTheme = signal<AppTheme>('system');
  readonly isDark = signal<boolean>(false);

  private mediaQueryListener?: (e: MediaQueryListEvent) => void;

  constructor() {
    this.initTheme();
  }

  private async initTheme() {
    // 1. Read from localStorage for immediate load, fallback to settings db
    const cached = (localStorage.getItem('reminder_theme') as AppTheme) || null;
    let initialTheme: AppTheme = cached || 'system';

    if (!cached) {
      try {
        initialTheme = await this.settingsRepo.getSetting<AppTheme>('theme', 'system');
      } catch {
        initialTheme = 'system';
      }
    }

    this.currentTheme.set(initialTheme);
    this.applyTheme(initialTheme);

    // Watch for OS system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQueryListener = (e: MediaQueryListEvent) => {
      if (this.currentTheme() === 'system') {
        this.applyDarkClass(e.matches);
      }
    };
    mediaQuery.addEventListener('change', this.mediaQueryListener);
  }

  async setTheme(theme: AppTheme) {
    this.currentTheme.set(theme);
    localStorage.setItem('reminder_theme', theme);
    try {
      await this.settingsRepo.setSetting('theme', theme);
    } catch (e) {
      console.warn('Failed to persist theme to IndexedDB', e);
    }
    this.applyTheme(theme);
  }

  private applyTheme(theme: AppTheme) {
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyDarkClass(systemDark);
    } else {
      this.applyDarkClass(theme === 'dark');
    }
  }

  private applyDarkClass(dark: boolean) {
    this.isDark.set(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
