import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Reminder, SnoozeDuration } from '../../../../core/models/reminder.model';

@Component({
  selector: 'app-snooze-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      title="Snooze Reminder"
      (close)="cancelled.emit()"
    >
      <div class="space-y-4">
        @if (reminder()) {
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
            <h4 class="text-xs font-semibold text-slate-500 dark:text-slate-400">Snoozing item:</h4>
            <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{{ reminder()?.title }}</p>
          </div>
        }

        <p class="text-xs text-slate-500 dark:text-slate-400">
          Select when you want to be reminded again:
        </p>

        <!-- Quick Snooze Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            (click)="selectDuration('5m')"
            class="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            ⏱️ 5 Minutes
          </button>

          <button
            type="button"
            (click)="selectDuration('10m')"
            class="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            ⏱️ 10 Minutes
          </button>

          <button
            type="button"
            (click)="selectDuration('15m')"
            class="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            ⏱️ 15 Minutes
          </button>

          <button
            type="button"
            (click)="selectDuration('30m')"
            class="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            ⏱️ 30 Minutes
          </button>

          <button
            type="button"
            (click)="selectDuration('1h')"
            class="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            ⏰ 1 Hour
          </button>

          <button
            type="button"
            (click)="selectDuration('3h')"
            class="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            ⏰ 3 Hours
          </button>
        </div>

        <!-- Tomorrow option -->
        <button
          type="button"
          (click)="selectDuration('tomorrow')"
          class="w-full flex items-center justify-center p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold text-indigo-700 dark:text-indigo-300 transition-all cursor-pointer"
        >
          🌅 Tomorrow Morning (09:00 AM)
        </button>

        <!-- Custom time picker -->
        <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Or pick a custom date & time:
          </label>
          <div class="flex items-center space-x-2">
            <input
              type="datetime-local"
              [(ngModel)]="customDateTime"
              class="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
            <app-button
              variant="secondary"
              size="sm"
              [disabled]="!customDateTime"
              (clicked)="applyCustom()"
            >
              Set
            </app-button>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <app-button variant="ghost" size="sm" (clicked)="cancelled.emit()">
            Cancel
          </app-button>
        </div>
      </div>
    </app-modal>
  `
})
export class SnoozeModalComponent {
  isOpen = input<boolean>(false);
  reminder = input<Reminder | null>(null);

  snoozed = output<{ duration: SnoozeDuration; customIsoTime?: string }>();
  cancelled = output<void>();

  customDateTime = '';

  selectDuration(duration: SnoozeDuration) {
    this.snoozed.emit({ duration });
  }

  applyCustom() {
    if (this.customDateTime) {
      this.snoozed.emit({
        duration: 'custom',
        customIsoTime: new Date(this.customDateTime).toISOString()
      });
    }
  }
}
