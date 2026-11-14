import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { PwaInstallService } from '../../../core/services/pwa-install.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SyncService } from '../../../core/services/sync.service';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <header class="sticky top-0 z-30 w-full backdrop-blur-md bg-[#F5F8FC]/90 dark:bg-[#1B2E40]/95 border-b border-[#D9E4EC] dark:border-[#365874] px-4 sm:px-6 py-3 transition-colors duration-200">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        
        <!-- ASTRA Brand Header Lockup -->
        <div class="flex items-center space-x-3">
          <div class="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1166B3] via-[#2A86CB] to-[#7DC0E5] flex items-center justify-center text-white shadow-md shadow-[#1166B3]/25 border border-[#ABDAF0]/30 shrink-0">
            <!-- ASTRA Stylized Star Emblem -->
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 2L15 9L22 9L16.5 13.5L18.5 20.5L12 16L5.5 20.5L7.5 13.5L2 9L9 9Z" fill="white" />
              <path d="M12 2L14 10L22 9" stroke="#ABDAF0" stroke-width="1.5" />
            </svg>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h1 class="text-base sm:text-lg font-black tracking-wider text-[#142536] dark:text-white leading-none">
                ASTRA
              </h1>
              <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#E9F0F6] dark:bg-[#27465F] text-[#1166B3] dark:text-[#ABDAF0] border border-[#D9E4EC] dark:border-[#365874]">
                REMINDER
              </span>
            </div>
            <p class="text-[9px] font-bold text-[#1166B3] dark:text-[#7DC0E5] tracking-widest uppercase mt-0.5 hidden sm:block">
              TECHNOLOGY HORIZON
            </p>
          </div>
        </div>

        <!-- Action Items -->
        <div class="flex items-center space-x-2 sm:space-x-2.5">
          
          <!-- Global Search Button (Omnibar Trigger) -->
          <button
            type="button"
            (click)="openSearch.emit()"
            class="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs text-[#142536] dark:text-[#ABDAF0] hover:bg-[#E9F0F6] dark:hover:bg-[#27465F] border border-[#D9E4EC] dark:border-[#365874] cursor-pointer transition-all"
            title="Search reminders, events, birthdays, festivals (⌘K / Ctrl+K)"
          >
            <span>🔍</span>
            <span class="hidden md:inline text-[#566B7E] dark:text-[#ABDAF0]/80">Search</span>
            <kbd class="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#1B2E40] text-[#566B7E] dark:text-[#ABDAF0]/70 border border-[#D9E4EC] dark:border-[#365874]">
              ⌘K
            </kbd>
          </button>

          <!-- Language Switcher Toggle (EN / ने) -->
          <button
            type="button"
            (click)="toggleLanguage()"
            class="px-2.5 py-1 text-xs font-bold rounded-xl border border-[#D9E4EC] dark:border-[#365874] text-[#142536] dark:text-[#ABDAF0] hover:bg-[#E9F0F6] dark:hover:bg-[#27465F] cursor-pointer transition-all"
            [title]="i18n.currentLang() === 'en' ? 'नेपाली भाषामा बदल्नुहोस्' : 'Switch to English'"
          >
            {{ i18n.currentLang() === 'en' ? 'ने' : 'EN' }}
          </button>

          <!-- ☀️ / 🌙 Instant Theme Toggle Button -->
          <button
            type="button"
            (click)="toggleTheme()"
            aria-label="Toggle light and dark theme"
            class="p-2 rounded-xl text-[#142536] dark:text-[#ABDAF0] hover:bg-[#E9F0F6] dark:hover:bg-[#27465F] border border-[#D9E4EC] dark:border-[#365874] transition-all cursor-pointer shadow-2xs"
            [title]="themeService.isDark() ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          >
            @if (themeService.isDark()) {
              <!-- Sun Icon for switching to light -->
              <svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            } @else {
              <!-- Moon Icon for switching to dark -->
              <svg class="w-4 h-4 text-[#1166B3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          </button>

          <!-- Cloud Sync Status Pill -->
          <div class="flex items-center">
            @if (authService.isAuthenticated()) {
              @switch (syncService.syncStatus()) {
                @case ('syncing') {
                  <button
                    type="button"
                    class="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-[#E9F0F6] dark:bg-[#27465F] text-[#1166B3] dark:text-[#ABDAF0] border border-[#D9E4EC] dark:border-[#365874]"
                    title="Synchronizing with Google Drive"
                  >
                    <span class="animate-spin text-xs">🔄</span>
                    <span class="hidden md:inline">Syncing...</span>
                  </button>
                }
                @case ('offline') {
                  <button
                    type="button"
                    class="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-[#E9F0F6] dark:bg-[#27465F] text-[#566B7E] dark:text-[#ABDAF0]/70 border border-[#D9E4EC] dark:border-[#365874]"
                    title="Offline. Changes will sync automatically when connected."
                  >
                    <span>📴</span>
                    <span class="hidden md:inline">Offline</span>
                  </button>
                }
                @case ('sync_failed') {
                  <button
                    type="button"
                    (click)="syncService.syncNow()"
                    class="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 cursor-pointer"
                    title="Sync failed. Click to retry."
                  >
                    <span>⚠️</span>
                    <span>Retry Sync</span>
                  </button>
                }
                @default {
                  <button
                    type="button"
                    (click)="syncService.syncNow()"
                    class="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/60 cursor-pointer"
                    [title]="syncService.lastSyncedAt() ? 'Synced with Drive (' + (syncService.lastSyncedAt() | date:'shortTime') + ')' : 'Synced with Drive'"
                  >
                    <span>☁️</span>
                    <span class="hidden md:inline">Synced</span>
                  </button>
                }
              }
            } @else {
              <!-- Not connected to Google Drive -->
              <span class="hidden lg:inline-flex items-center space-x-1 text-[11px] text-[#566B7E] dark:text-[#ABDAF0]/70 font-semibold px-2 py-0.5 rounded border border-[#D9E4EC] dark:border-[#365874]">
                <span>Local IndexedDB</span>
              </span>
            }
          </div>

          <!-- PWA Install Button (shown when installable) -->
          @if (pwaInstall.canInstall()) {
            <button
              (click)="pwaInstall.promptInstall()"
              type="button"
              class="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Install App</span>
            </button>
          }

          <!-- Quick Add Reminder Button -->
          <app-button
            variant="primary"
            size="sm"
            (clicked)="openQuickAdd.emit()"
          >
            <span class="mr-1 text-base leading-none">+</span>
            <span class="hidden sm:inline">Add Reminder</span>
            <span class="sm:hidden">Add</span>
          </app-button>
        </div>

      </div>
    </header>
  `
})
export class HeaderComponent {
  readonly themeService = inject(ThemeService);
  readonly pwaInstall = inject(PwaInstallService);
  readonly notificationService = inject(NotificationService);
  readonly syncService = inject(SyncService);
  readonly authService = inject(AuthService);
  readonly i18n = inject(I18nService);

  openQuickAdd = output<void>();
  openSearch = output<void>();

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleLanguage() {
    const next = this.i18n.currentLang() === 'en' ? 'ne' : 'en';
    this.i18n.setLanguage(next);
  }
}
