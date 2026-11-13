import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { PwaInstallService } from '../../../core/services/pwa-install.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <header class="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-[#090d16]/80 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 transition-colors">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        
        <!-- Brand / Identity -->
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 font-bold text-lg">
            R
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h1 class="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">REMINDER</h1>
              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                PWA
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Offline-First Personal Assistant
            </p>
          </div>
        </div>

        <!-- Action Items -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <!-- PWA Install Button (shown when installable) -->
          @if (pwaInstall.canInstall()) {
            <button
              (click)="pwaInstall.promptInstall()"
              type="button"
              class="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Install App</span>
            </button>
          }

          <!-- Theme Toggle -->
          <button
            type="button"
            (click)="toggleTheme()"
            aria-label="Toggle theme"
            class="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer"
          >
            @if (themeService.isDark()) {
              <!-- Sun Icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            } @else {
              <!-- Moon Icon -->
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            }
          </button>

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
  openQuickAdd = output<void>();

  toggleTheme() {
    const next = this.themeService.isDark() ? 'light' : 'dark';
    this.themeService.setTheme(next);
  }
}
