import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncService } from '../../../core/services/sync.service';
import { Reminder } from '../../../core/models/reminder.model';

@Component({
  selector: 'app-conflict-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (syncService.activeConflict(); as conflict) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          
          <div class="flex items-center space-x-3 text-amber-500">
            <span class="text-2xl">⚠️</span>
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">Sync Conflict Detected</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                This item was updated concurrently on another device. Which version would you like to keep?
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <!-- Local Version -->
            <div class="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
              <div class="flex items-center justify-between font-semibold text-indigo-700 dark:text-indigo-300">
                <span>📱 Local Version</span>
                <span class="text-[10px] opacity-75">{{ conflict.localUpdatedAt | date:'shortTime' }}</span>
              </div>
              <p class="font-medium text-slate-900 dark:text-white text-sm">
                {{ getReminderTitle(conflict.localData) }}
              </p>
              <p class="text-slate-600 dark:text-slate-400 line-clamp-2">
                {{ getReminderDesc(conflict.localData) || 'No description' }}
              </p>
              <button
                type="button"
                (click)="syncService.resolveConflict(conflict, 'local')"
                class="w-full mt-2 py-1.5 px-3 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white text-center cursor-pointer shadow-sm transition-all"
              >
                Keep Local
              </button>
            </div>

            <!-- Cloud Version -->
            <div class="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
              <div class="flex items-center justify-between font-semibold text-emerald-700 dark:text-emerald-300">
                <span>☁️ Cloud Version</span>
                <span class="text-[10px] opacity-75">{{ conflict.cloudUpdatedAt | date:'shortTime' }}</span>
              </div>
              <p class="font-medium text-slate-900 dark:text-white text-sm">
                {{ getReminderTitle(conflict.cloudData) }}
              </p>
              <p class="text-slate-600 dark:text-slate-400 line-clamp-2">
                {{ getReminderDesc(conflict.cloudData) || 'No description' }}
              </p>
              <button
                type="button"
                (click)="syncService.resolveConflict(conflict, 'cloud')"
                class="w-full mt-2 py-1.5 px-3 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white text-center cursor-pointer shadow-sm transition-all"
              >
                Keep Cloud
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `
})
export class ConflictModalComponent {
  readonly syncService = inject(SyncService);

  getReminderTitle(data: unknown): string {
    const r = data as Partial<Reminder>;
    return r?.title || 'Untitled';
  }

  getReminderDesc(data: unknown): string {
    const r = data as Partial<Reminder>;
    return r?.description || '';
  }
}
