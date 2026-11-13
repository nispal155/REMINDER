import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from './settings.service';
import { ThemeService } from '../../core/services/theme.service';
import { IndexedDbService } from '../../core/services/indexed-db.service';
import { PwaInstallService } from '../../core/services/pwa-install.service';
import { NotificationService } from '../../core/services/notification.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AppTheme, CalendarType } from '../../core/models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, CardComponent, ButtonComponent],
  template: `
    <div class="space-y-6 max-w-4xl">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Configure appearance, calendar preference, and offline storage</p>
      </div>

      <!-- Appearance -->
      <app-card>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Appearance & Theme</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Choose between light, dark, or system matching theme.</p>
        
        <div class="grid grid-cols-3 gap-3">
          <button
            type="button"
            (click)="settingsService.updateTheme('light')"
            [class.border-indigo-600]="settingsService.settings().theme === 'light'"
            [class.ring-2]="settingsService.settings().theme === 'light'"
            [class.ring-indigo-600]="settingsService.settings().theme === 'light'"
            class="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span class="text-2xl mb-1.5">☀️</span>
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">Light</span>
          </button>

          <button
            type="button"
            (click)="settingsService.updateTheme('dark')"
            [class.border-indigo-600]="settingsService.settings().theme === 'dark'"
            [class.ring-2]="settingsService.settings().theme === 'dark'"
            [class.ring-indigo-600]="settingsService.settings().theme === 'dark'"
            class="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span class="text-2xl mb-1.5">🌙</span>
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">Dark</span>
          </button>

          <button
            type="button"
            (click)="settingsService.updateTheme('system')"
            [class.border-indigo-600]="settingsService.settings().theme === 'system'"
            [class.ring-2]="settingsService.settings().theme === 'system'"
            [class.ring-indigo-600]="settingsService.settings().theme === 'system'"
            class="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span class="text-2xl mb-1.5">💻</span>
            <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">System</span>
          </button>
        </div>
      </app-card>

      <!-- Calendar System Preference -->
      <app-card>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Primary Calendar</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Select which calendar system to prioritize in headings and inputs.</p>

        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            (click)="settingsService.updateDefaultCalendar('BS')"
            [class.border-indigo-600]="settingsService.settings().defaultCalendar === 'BS'"
            [class.ring-2]="settingsService.settings().defaultCalendar === 'BS'"
            [class.ring-indigo-600]="settingsService.settings().defaultCalendar === 'BS'"
            class="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span class="text-2xl">🇳🇵</span>
            <div class="text-left">
              <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Bikram Sambat (BS)</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Nepali National Calendar</p>
            </div>
          </button>

          <button
            type="button"
            (click)="settingsService.updateDefaultCalendar('AD')"
            [class.border-indigo-600]="settingsService.settings().defaultCalendar === 'AD'"
            [class.ring-2]="settingsService.settings().defaultCalendar === 'AD'"
            [class.ring-indigo-600]="settingsService.settings().defaultCalendar === 'AD'"
            class="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span class="text-2xl">🌐</span>
            <div class="text-left">
              <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Gregorian (AD)</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Standard English Calendar</p>
            </div>
          </button>
        </div>
      </app-card>

      <!-- Notifications & Alert Engine -->
      <app-card>
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Notifications & Alerts</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Offline alarm engine using Web Notifications and Service Worker actions.
            </p>
          </div>

          <!-- Permission Status Badge -->
          <div class="flex items-center space-x-2">
            @switch (notificationService.permissionState()) {
              @case ('granted') {
                <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Permission Granted</span>
                </span>
              }
              @case ('denied') {
                <span class="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                  <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Blocked in Browser</span>
                </span>
              }
              @case ('default') {
                <app-button variant="primary" size="sm" (clicked)="onRequestPermission()">
                  Enable Notifications
                </app-button>
              }
              @case ('unsupported') {
                <span class="text-xs text-slate-400">Notifications Unsupported</span>
              }
            }
          </div>
        </div>

        <div class="space-y-4 pt-4">
          <!-- Master Switch & Sound/Vibration -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 cursor-pointer">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Enable Alerts</span>
              <input
                type="checkbox"
                [checked]="settingsService.settings().notificationsEnabled"
                (change)="settingsService.updateNotificationsEnabled(!settingsService.settings().notificationsEnabled)"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 cursor-pointer">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Alert Sound</span>
              <input
                type="checkbox"
                [checked]="settingsService.settings().notificationSound"
                (change)="settingsService.updateNotificationSound(!settingsService.settings().notificationSound)"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label class="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/60 cursor-pointer">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Vibration</span>
              <input
                type="checkbox"
                [checked]="settingsService.settings().notificationVibration"
                (change)="settingsService.updateNotificationVibration(!settingsService.settings().notificationVibration)"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>

          <!-- Quiet Hours -->
          <div class="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  🌙 Quiet Hours (Do Not Disturb)
                </h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  Silence or defer notifications during night hours (e.g. 10:00 PM to 07:00 AM).
                </p>
              </div>
              <input
                type="checkbox"
                [checked]="settingsService.settings().quietHours.enabled"
                (change)="onToggleQuietHours()"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            @if (settingsService.settings().quietHours.enabled) {
              <div class="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    [value]="settingsService.settings().quietHours.startTime"
                    (change)="onQuietHoursTimeChange($event, 'start')"
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    [value]="settingsService.settings().quietHours.endTime"
                    (change)="onQuietHoursTimeChange($event, 'end')"
                    class="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            }
          </div>

          <!-- Test Notification Trigger -->
          <div class="pt-1 flex items-center justify-between">
            <span class="text-xs text-slate-500 dark:text-slate-400">
              Verify your browser's audio and alert capabilities:
            </span>
            <app-button variant="secondary" size="sm" (clicked)="onSendTestNotification()">
              🔔 Send Test Alert
            </app-button>
          </div>
        </div>
      </app-card>

      <!-- IndexedDB & Storage Health -->
      <app-card>
        <div class="flex items-center justify-between mb-2">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Local IndexedDB Storage</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">All data is stored directly inside your browser's Dexie database.</p>
          </div>
          <button
            type="button"
            (click)="refreshStats()"
            class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
          >
            Refresh
          </button>
        </div>

        @if (dbStats()) {
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Reminders</span>
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ dbStats()?.reminders }}</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Events</span>
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ dbStats()?.events }}</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
              <span class="text-[11px] text-slate-500 dark:text-slate-400">Birthdays</span>
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ dbStats()?.birthdays }}</p>
            </div>
          </div>
        }

        <!-- Storage quota estimate -->
        @if (storageEstimate()) {
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 mb-4">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="text-slate-500 dark:text-slate-400">Estimated Browser Quota Used</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">
                {{ storageEstimate()?.usageMB }} MB / {{ storageEstimate()?.quotaMB }} MB ({{ storageEstimate()?.percentage }}%)
              </span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                class="bg-indigo-600 h-full rounded-full transition-all duration-300"
                [style.width.%]="storageEstimate()?.percentage || 1"
              ></div>
            </div>
          </div>
        }

        <!-- Actions -->
        <div class="flex flex-wrap items-center gap-3 pt-2">
          <app-button
            variant="secondary"
            size="sm"
            (clicked)="onSeedDemo()"
          >
            🌱 Load Sample Data
          </app-button>

          <app-button
            variant="danger"
            size="sm"
            (clicked)="onClearDatabase()"
          >
            🗑️ Clear All Local Data
          </app-button>
        </div>
      </app-card>

      <!-- PWA Status -->
      <app-card>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">PWA & Offline Status</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Service Worker is registered with background offline caching.
            </p>
          </div>
          @if (pwaInstall.isInstalled()) {
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Installed
            </span>
          } @else if (pwaInstall.canInstall()) {
            <app-button variant="primary" size="sm" (clicked)="pwaInstall.promptInstall()">
              Install to Device
            </app-button>
          } @else {
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              Web Mode
            </span>
          }
        </div>
      </app-card>

    </div>
  `
})
export class SettingsComponent implements OnInit {
  readonly settingsService = inject(SettingsService);
  readonly themeService = inject(ThemeService);
  readonly pwaInstall = inject(PwaInstallService);
  readonly notificationService = inject(NotificationService);
  private readonly indexedDbService = inject(IndexedDbService);

  readonly dbStats = signal<any>(null);
  readonly storageEstimate = signal<any>(null);

  async ngOnInit() {
    await this.refreshStats();
  }

  async onRequestPermission() {
    await this.notificationService.requestPermission();
  }

  async onToggleQuietHours() {
    const cur = this.settingsService.settings().quietHours;
    await this.settingsService.updateQuietHours({
      ...cur,
      enabled: !cur.enabled
    });
  }

  async onQuietHoursTimeChange(event: Event, type: 'start' | 'end') {
    const input = event.target as HTMLInputElement;
    const cur = this.settingsService.settings().quietHours;
    if (type === 'start') {
      await this.settingsService.updateQuietHours({ ...cur, startTime: input.value });
    } else {
      await this.settingsService.updateQuietHours({ ...cur, endTime: input.value });
    }
  }

  async onSendTestNotification() {
    if (this.notificationService.permissionState() !== 'granted') {
      const state = await this.notificationService.requestPermission();
      if (state !== 'granted') return;
    }

    await this.notificationService.showNotification('🔔 Test Notification', {
      body: 'REMINDER notification engine is functioning offline with sound and vibration!',
      soundEnabled: this.settingsService.settings().notificationSound,
      vibrationEnabled: this.settingsService.settings().notificationVibration
    });
  }

  async refreshStats() {
    const stats = await this.indexedDbService.getDatabaseStats();
    this.dbStats.set(stats);
    const estimate = await this.indexedDbService.getStorageEstimate();
    this.storageEstimate.set(estimate);
  }

  async onSeedDemo() {
    await this.settingsService.seedDemoData();
    await this.refreshStats();
  }

  async onClearDatabase() {
    if (confirm('Are you sure you want to clear all reminders, events, and birthdays from your local database?')) {
      await this.settingsService.clearDatabase();
      await this.refreshStats();
    }
  }
}

