import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from './settings.service';
import { ThemeService } from '../../core/services/theme.service';
import { IndexedDbService } from '../../core/services/indexed-db.service';
import { PwaInstallService } from '../../core/services/pwa-install.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { SyncService } from '../../core/services/sync.service';
import { BackupService } from '../../core/services/backup.service';
import { I18nService } from '../../core/services/i18n.service';
import { SoundService } from '../../core/services/sound.service';
import { ToastService } from '../../core/services/toast.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AppTheme, CalendarType, SoundChimeType } from '../../core/models/settings.model';
import { DriveFileItem } from '../../core/services/google-drive.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <div class="space-y-6 max-w-4xl">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Configure appearance, calendar, notifications, Google Drive sync, and backups</p>
      </div>

      <!-- Appearance -->
      <app-card>
        <h3 class="text-base font-bold text-[#142536] dark:text-white mb-1">ASTRA Theme & Appearance</h3>
        <p class="text-xs text-[#566B7E] dark:text-[#ABDAF0]/70 mb-4">Choose between light, dark (Midnight Navy), or system matching theme.</p>
        
        <div class="grid grid-cols-3 gap-3">
          <button
            type="button"
            (click)="settingsService.updateTheme('light')"
            [class.border-[#1166B3]]="settingsService.settings().theme === 'light'"
            [class.ring-2]="settingsService.settings().theme === 'light'"
            [class.ring-[#1166B3]]="settingsService.settings().theme === 'light'"
            class="flex flex-col items-center justify-center p-3.5 rounded-xl border border-[#D9E4EC] dark:border-[#365874] bg-white dark:bg-[#1B2E40] hover:bg-[#F5F8FC] dark:hover:bg-[#1F384F] transition-all cursor-pointer"
          >
            <span class="text-2xl mb-1.5">☀️</span>
            <span class="text-xs font-bold text-[#142536] dark:text-white">Light</span>
          </button>

          <button
            type="button"
            (click)="settingsService.updateTheme('dark')"
            [class.border-[#1166B3]]="settingsService.settings().theme === 'dark'"
            [class.dark:border-[#7DC0E5]]="settingsService.settings().theme === 'dark'"
            [class.ring-2]="settingsService.settings().theme === 'dark'"
            [class.ring-[#1166B3]]="settingsService.settings().theme === 'dark'"
            [class.dark:ring-[#7DC0E5]]="settingsService.settings().theme === 'dark'"
            class="flex flex-col items-center justify-center p-3.5 rounded-xl border border-[#D9E4EC] dark:border-[#365874] bg-white dark:bg-[#1B2E40] hover:bg-[#F5F8FC] dark:hover:bg-[#1F384F] transition-all cursor-pointer"
          >
            <span class="text-2xl mb-1.5">🌙</span>
            <span class="text-xs font-bold text-[#142536] dark:text-white">Midnight Dark</span>
          </button>

          <button
            type="button"
            (click)="settingsService.updateTheme('system')"
            [class.border-[#1166B3]]="settingsService.settings().theme === 'system'"
            [class.dark:border-[#7DC0E5]]="settingsService.settings().theme === 'system'"
            [class.ring-2]="settingsService.settings().theme === 'system'"
            [class.ring-[#1166B3]]="settingsService.settings().theme === 'system'"
            [class.dark:ring-[#7DC0E5]]="settingsService.settings().theme === 'system'"
            class="flex flex-col items-center justify-center p-3.5 rounded-xl border border-[#D9E4EC] dark:border-[#365874] bg-white dark:bg-[#1B2E40] hover:bg-[#F5F8FC] dark:hover:bg-[#1F384F] transition-all cursor-pointer"
          >
            <span class="text-2xl mb-1.5">💻</span>
            <span class="text-xs font-bold text-[#142536] dark:text-white">System Sync</span>
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

      <!-- Language & Numerals Preference -->
      <app-card>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Language & Numerals</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Choose application interface language and numeral display format.</p>

        <div class="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            (click)="i18n.setLanguage('en')"
            [class.border-indigo-600]="i18n.currentLang() === 'en'"
            [class.ring-2]="i18n.currentLang() === 'en'"
            [class.ring-indigo-600]="i18n.currentLang() === 'en'"
            class="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span class="text-2xl">🇬🇧</span>
            <div class="text-left">
              <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">English</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Standard English</p>
            </div>
          </button>

          <button
            type="button"
            (click)="i18n.setLanguage('ne')"
            [class.border-indigo-600]="i18n.currentLang() === 'ne'"
            [class.ring-2]="i18n.currentLang() === 'ne'"
            [class.ring-indigo-600]="i18n.currentLang() === 'ne'"
            class="flex items-center space-x-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <span class="text-2xl">🇳🇵</span>
            <div class="text-left">
              <h4 class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">नेपाली</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">नेपाली भाषा</p>
            </div>
          </button>
        </div>

        <div class="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h4 class="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">Nepali Numerals (०-९)</h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Display dates and task counts in Devanagari numerals</p>
          </div>
          <input
            type="checkbox"
            [checked]="i18n.nepaliNumeralsEnabled()"
            (change)="i18n.setNepaliNumerals(!i18n.nepaliNumeralsEnabled())"
            class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
      </app-card>

      <!-- Google OAuth & Google Drive Sync Section -->
      <app-card>
        <div class="flex items-center justify-between mb-2">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Google Drive Cloud Sync</span>
              @if (authService.isAuthenticated()) {
                <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                  Connected
                </span>
              } @else {
                <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Not Connected
                </span>
              }
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              IndexedDB stays primary. Google Drive backs up data and syncs across devices.
            </p>
          </div>

          @if (authService.isAuthenticated()) {
            <app-button variant="secondary" size="sm" (clicked)="onSignOut()">
              Sign Out
            </app-button>
          } @else {
            <app-button variant="primary" size="sm" (clicked)="onSignIn()" [disabled]="authService.isLoading()">
              @if (authService.isLoading()) {
                <span>Connecting...</span>
              } @else {
                <span>Sign in with Google</span>
              }
            </app-button>
          }
        </div>

        @if (authService.authError()) {
          <div class="p-3 my-3 rounded-xl text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
            {{ authService.authError() }}
          </div>
        }

        <!-- Authenticated Profile Details -->
        @if (authService.currentUser(); as user) {
          <div class="flex items-center space-x-3 p-3 my-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            @if (user.picture) {
              <img [src]="user.picture" alt="User avatar" class="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700" />
            } @else {
              <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                {{ user.name.charAt(0) }}
              </div>
            }
            <div class="flex-1 min-w-0">
              <h4 class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">{{ user.name }}</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">{{ user.email }}</p>
            </div>
            <div class="text-right text-[11px]">
              <span class="text-slate-400">Device ID:</span>
              <span class="font-mono text-slate-600 dark:text-slate-300 ml-1">{{ syncService.deviceId }}</span>
            </div>
          </div>

          <!-- Sync Controls -->
          <div class="p-3.5 my-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">Sync Status</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  @if (syncService.lastSyncedAt()) {
                    Last synced: {{ syncService.lastSyncedAt() | date:'medium' }}
                  } @else {
                    Never synced
                  }
                  @if (syncService.pendingCount() > 0) {
                    ({{ syncService.pendingCount() }} local changes pending)
                  }
                </p>
              </div>

              <div class="flex items-center space-x-2">
                <app-button
                  variant="primary"
                  size="sm"
                  (clicked)="onSyncNow()"
                  [disabled]="syncService.syncStatus() === 'syncing'"
                >
                  @if (syncService.syncStatus() === 'syncing') {
                    <span>Syncing...</span>
                  } @else {
                    <span>Sync Now</span>
                  }
                </app-button>
              </div>
            </div>
          </div>
        }

        <!-- Configuration Inputs -->
        <div class="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Google OAuth Client ID
            </label>
            <div class="flex space-x-2">
              <input
                type="text"
                [(ngModel)]="customClientId"
                placeholder="apps.googleusercontent.com"
                class="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                (click)="onSaveClientId()"
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
              >
                Save
              </button>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">Obtain from Google Cloud Console with Drive.file scope.</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Authorized Owner Google Email (Single-User Restriction)
            </label>
            <div class="flex space-x-2">
              <input
                type="email"
                [(ngModel)]="customAuthorizedEmail"
                placeholder="your.email@gmail.com"
                class="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <button
                type="button"
                (click)="onSaveAuthorizedEmail()"
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
              >
                Save
              </button>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">Only this Google account will be allowed to synchronize.</p>
          </div>
        </div>
      </app-card>

      <!-- Backups: Cloud & Local Section -->
      <app-card>
        <div class="mb-4">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Backups & Recovery</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Export standalone JSON backups locally or store complete snapshots in Google Drive.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <!-- Cloud Backup Action -->
          <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <h4 class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <span>☁️ Cloud Backup</span>
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Snapshot stored in REMINDER_APP/backups/ on your Google Drive.
            </p>
            <div class="pt-1">
              <app-button
                variant="primary"
                size="sm"
                (clicked)="onBackupToDrive()"
                [disabled]="!authService.isAuthenticated()"
              >
                Backup Now to Drive
              </app-button>
            </div>
          </div>

          <!-- Local Export / Import Action -->
          <div class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
            <h4 class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <span>💾 Local JSON File</span>
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Download or upload full backup JSON without requiring Google Drive.
            </p>
            <div class="flex items-center space-x-2 pt-1">
              <app-button variant="secondary" size="sm" (clicked)="onExportLocalJson()">
                Export JSON
              </app-button>
              <label class="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all">
                Import JSON
                <input type="file" accept=".json" class="hidden" (change)="onImportLocalJson($event)" />
              </label>
            </div>
          </div>
        </div>

        <!-- Available Drive Backups List -->
        @if (authService.isAuthenticated()) {
          <div class="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Available Cloud Backups
              </h4>
              <button
                type="button"
                (click)="onLoadDriveBackups()"
                class="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Refresh List
              </button>
            </div>

            @if (driveBackups().length > 0) {
              <div class="space-y-1.5 max-h-48 overflow-y-auto">
                @for (backup of driveBackups(); track backup.id) {
                  <div class="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ backup.name }}</p>
                      <p class="text-[10px] text-slate-400">{{ backup.modifiedTime | date:'medium' }}</p>
                    </div>
                    <button
                      type="button"
                      (click)="onRestoreFromDrive(backup.id)"
                      class="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                    >
                      Restore
                    </button>
                  </div>
                }
              </div>
            } @else {
              <p class="text-xs text-slate-400 italic">No cloud backups found in REMINDER_APP/backups yet.</p>
            }
          </div>
        }
      </app-card>

      <!-- Notification Engine Settings -->
      <app-card>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">Notifications & Alerts</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Control permission, quiet hours, sound chime, and haptic vibration.
        </p>

        <!-- System Permission Banner -->
        <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 mb-4">
          <div class="flex items-center space-x-3">
            <span class="text-2xl">
              @if (notificationService.permissionState() === 'granted') { ✅ }
              @else if (notificationService.permissionState() === 'denied') { 🚫 }
              @else { 🔔 }
            </span>
            <div>
              <h4 class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                Browser Permission:
                <span class="capitalize font-bold">{{ notificationService.permissionState() }}</span>
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                @if (notificationService.permissionState() === 'granted') {
                  Application has permission to display alert notifications.
                } @else if (notificationService.permissionState() === 'denied') {
                  Permission was denied. Please unblock notifications in browser address bar.
                } @else {
                  Permission has not been requested yet.
                }
              </p>
            </div>
          </div>

          @if (notificationService.permissionState() !== 'granted') {
            <app-button variant="primary" size="sm" (clicked)="onRequestPermission()">
              Allow Alerts
            </app-button>
          }
        </div>

        <!-- Notification Toggles -->
        <div class="space-y-3">
          <!-- Enable Notifications Toggle -->
          <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 class="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">Notifications Enabled</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Trigger alerts when reminder due time arrives</p>
            </div>
            <input
              type="checkbox"
              [checked]="settingsService.settings().notificationsEnabled"
              (change)="settingsService.updateNotificationsEnabled(!settingsService.settings().notificationsEnabled)"
              class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <!-- Sound Chime Toggle & Picker -->
          <div class="py-2 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">Audio Chime</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Play pleasant synthesized harmonic chimes on alert</p>
              </div>
              <input
                type="checkbox"
                [checked]="settingsService.settings().notificationSound"
                (change)="settingsService.updateNotificationSound(!settingsService.settings().notificationSound)"
                class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            @if (settingsService.settings().notificationSound) {
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div class="flex-1">
                  <label class="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Chime Synthesizer Tone
                  </label>
                  <select
                    [ngModel]="settingsService.settings().soundChime || 'temple'"
                    (ngModelChange)="onChimeSelected($event)"
                    class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="temple">🔔 Tibetan Temple Bell (Rich bronze harmonic overtone)</option>
                    <option value="singing_bowl">🥣 Himalayan Singing Bowl (432Hz deep meditative resonance)</option>
                    <option value="digital">⚡ Digital Arp (Modern crisp dual-tone)</option>
                    <option value="classic">🛎️ Classic Bell (Traditional melodic sine)</option>
                  </select>
                </div>
                <div class="sm:pt-4">
                  <button
                    type="button"
                    (click)="onPreviewTone()"
                    class="w-full sm:w-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer"
                  >
                    🔊 Test Tone
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Vibration Toggle -->
          <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 class="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">Haptic Vibration</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">Vibrate mobile phone when supported</p>
            </div>
            <input
              type="checkbox"
              [checked]="settingsService.settings().notificationVibration"
              (change)="settingsService.updateNotificationVibration(!settingsService.settings().notificationVibration)"
              class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          <!-- Quiet Hours -->
          <div class="py-2 space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">Quiet Hours (Do Not Disturb)</h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">Mute sound & vibration during sleep hours</p>
              </div>
              <input
                type="checkbox"
                [checked]="settingsService.settings().quietHours.enabled"
                (change)="onToggleQuietHours()"
                class="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            @if (settingsService.settings().quietHours.enabled) {
              <div class="flex items-center space-x-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs">
                <div>
                  <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    [value]="settingsService.settings().quietHours.startTime"
                    (change)="onQuietHoursTimeChange($event, 'start')"
                    class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <span class="text-slate-400 font-bold mt-4">→</span>
                <div>
                  <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    [value]="settingsService.settings().quietHours.endTime"
                    (change)="onQuietHoursTimeChange($event, 'end')"
                    class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            }
          </div>

          <!-- Test Notification Trigger -->
          <div class="pt-2">
            <app-button variant="secondary" size="sm" (clicked)="onSendTestNotification()">
              🔔 Send Test Notification
            </app-button>
          </div>
        </div>
      </app-card>

      <!-- Local IndexedDB Storage Diagnostic -->
      <app-card>
        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">IndexedDB Storage</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Local Dexie.js database statistics and storage quota.
        </p>

        @if (dbStats(); as stats) {
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span class="text-xs text-slate-500 dark:text-slate-400">Reminders</span>
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ stats.reminders }}</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span class="text-xs text-slate-500 dark:text-slate-400">Events</span>
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ stats.events }}</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span class="text-xs text-slate-500 dark:text-slate-400">Birthdays</span>
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ stats.birthdays }}</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span class="text-xs text-slate-500 dark:text-slate-400">Attachments</span>
              <p class="text-lg font-bold text-slate-900 dark:text-white">{{ stats.attachments }}</p>
            </div>
          </div>
        }

        <div class="flex flex-wrap gap-2 pt-2">
          <app-button variant="secondary" size="sm" (clicked)="onPurgeSyncedBlobs()">
            🧹 Purge Synced Attachment Blobs
          </app-button>
          <app-button variant="secondary" size="sm" (clicked)="onArchiveOldCompleted()">
            📦 Archive Completed (> 6 Months)
          </app-button>
          <app-button variant="secondary" size="sm" (clicked)="onSeedDemo()">
            🌱 Load Sample Reminders
          </app-button>
          <app-button variant="danger" size="sm" (clicked)="onClearDatabase()">
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
  readonly authService = inject(AuthService);
  readonly syncService = inject(SyncService);
  readonly backupService = inject(BackupService);
  readonly i18n = inject(I18nService);
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly soundService = inject(SoundService);
  private readonly toast = inject(ToastService);

  readonly dbStats = signal<any>(null);
  readonly storageEstimate = signal<any>(null);
  readonly driveBackups = signal<DriveFileItem[]>([]);

  customClientId = '';
  customAuthorizedEmail = '';

  async ngOnInit() {
    this.customClientId = this.authService.getClientId();
    this.customAuthorizedEmail = this.authService.getAuthorizedEmail();
    await this.refreshStats();
    if (this.authService.isAuthenticated()) {
      await this.onLoadDriveBackups();
    }
  }

  onSaveClientId() {
    this.authService.setClientId(this.customClientId);
  }

  onSaveAuthorizedEmail() {
    this.authService.setAuthorizedEmail(this.customAuthorizedEmail);
  }

  async onSignIn() {
    await this.authService.login();
    if (this.authService.isAuthenticated()) {
      await this.syncService.syncNow();
      await this.onLoadDriveBackups();
    }
  }

  async onSignOut() {
    await this.authService.logout();
    this.driveBackups.set([]);
  }

  async onSyncNow() {
    await this.syncService.syncNow();
    await this.refreshStats();
  }

  async onBackupToDrive() {
    await this.backupService.backupToDrive();
    await this.onLoadDriveBackups();
  }

  async onLoadDriveBackups() {
    const list = await this.backupService.listDriveBackups();
    this.driveBackups.set(list);
  }

  async onRestoreFromDrive(fileId: string) {
    if (confirm('Restoring this backup will replace current local reminders. Do you want to proceed?')) {
      await this.backupService.restoreFromDrive(fileId);
      await this.refreshStats();
    }
  }

  async onExportLocalJson() {
    await this.backupService.exportLocalJson();
  }

  async onImportLocalJson(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (confirm(`Import ${file.name}? This will restore data into your local database.`)) {
        await this.backupService.importLocalJson(file);
        await this.refreshStats();
      }
      input.value = '';
    }
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

  async onChimeSelected(chime: SoundChimeType) {
    await this.settingsService.updateSoundChime(chime);
    this.soundService.playChime(chime);
  }

  onPreviewTone() {
    this.soundService.playChime();
  }

  async onPurgeSyncedBlobs() {
    const purged = await this.indexedDbService.purgeSyncedAttachmentBlobs();
    await this.refreshStats();
    this.toast.success(`Purged ${purged} local cached attachment blob(s). Google Drive links preserved.`);
  }

  async onArchiveOldCompleted() {
    const count = await this.indexedDbService.archiveCompletedOlderThan(6);
    await this.refreshStats();
    this.toast.info(`Archived/cleaned ${count} completed reminder(s) older than 6 months.`);
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
