import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reminder, Priority } from '../../../../core/models/reminder.model';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'app-reminder-card',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <app-card [interactive]="true">
      <div class="flex items-start justify-between gap-3">
        
        <!-- Left: Checkbox + Content -->
        <div class="flex items-start space-x-3.5 flex-1 min-w-0">
          <input
            type="checkbox"
            [checked]="reminder().status === 'completed'"
            (change)="completedToggled.emit(reminder())"
            class="mt-1 h-5 w-5 rounded-md border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0"
          />

          <div class="min-w-0 flex-1">
            <div class="flex items-center space-x-2 flex-wrap">
              <h3
                class="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate"
                [class.line-through]="reminder().status === 'completed'"
                [class.opacity-50]="reminder().status === 'completed'"
              >
                {{ reminder().title }}
              </h3>

              <!-- Priority Badge -->
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize shrink-0"
                [ngClass]="getPriorityClasses(reminder().priority)"
              >
                {{ reminder().priority }}
              </span>

              <!-- Status Badge (if snoozed or overdue) -->
              @if (reminder().status === 'snoozed') {
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 shrink-0">
                  💤 Snoozed
                </span>
              }
            </div>

            @if (reminder().description) {
              <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {{ reminder().description }}
              </p>
            }

            <!-- Metadata footer -->
            <div class="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
              <!-- Dual Date Badge -->
              <span class="inline-flex items-center space-x-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                <span>🇳🇵 {{ reminder().dateBS }}</span>
                <span class="opacity-50">/</span>
                <span>🌐 {{ reminder().dateAD }}</span>
              </span>

              <span>•</span>
              <span class="flex items-center space-x-1">
                <span>⏰</span>
                <span>{{ reminder().time }}</span>
              </span>

              <span>•</span>
              <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                {{ reminder().category }}
              </span>

              @if (reminder().repeatType !== 'none') {
                <span class="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-semibold">
                  <span>🔁</span>
                  <span class="capitalize">{{ formatRepeatType(reminder().repeatType) }}</span>
                </span>
              }

              @if (nextNotification()) {
                <span class="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                  <span>🔔 Next alert:</span>
                  <span>{{ nextNotification() }}</span>
                </span>
              }
            </div>
          </div>
        </div>

        <!-- Right: Action Buttons -->
        <div class="flex items-center space-x-1 shrink-0">
          <!-- Snooze button -->
          <button
            type="button"
            (click)="snoozeClicked.emit(reminder())"
            class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
            title="Snooze"
          >
            <span class="text-sm">💤</span>
          </button>

          <!-- Edit button -->
          <button
            type="button"
            (click)="editClicked.emit(reminder())"
            class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
            title="Edit reminder"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          <!-- Duplicate button -->
          <button
            type="button"
            (click)="duplicateClicked.emit(reminder())"
            class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
            title="Duplicate reminder"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <!-- Delete button -->
          <button
            type="button"
            (click)="deleteClicked.emit(reminder())"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Delete reminder"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

      </div>
    </app-card>
  `
})
export class ReminderCardComponent {
  reminder = input.required<Reminder>();

  completedToggled = output<Reminder>();
  editClicked = output<Reminder>();
  snoozeClicked = output<Reminder>();
  duplicateClicked = output<Reminder>();
  deleteClicked = output<Reminder>();

  readonly nextNotification = computed<string | null>(() => {
    const r = this.reminder();
    if (r.status === 'completed' || r.status === 'dismissed') return null;

    const leadTimes = r.notificationSchedule?.minutesBefore || [0];
    const parts = r.dateAD.split('-').map(Number);
    const timeParts = r.time.split(':').map(Number);
    const eventTime = new Date(parts[0], parts[1] - 1, parts[2], timeParts[0], timeParts[1]).getTime();
    const now = Date.now();

    const futureAlertTimes = leadTimes
      .map(m => eventTime - m * 60 * 1000)
      .filter(t => t > now)
      .sort((a, b) => a - b);

    if (futureAlertTimes.length === 0) return null;
    const nextTime = new Date(futureAlertTimes[0]);
    const nowDate = new Date();
    const timeStr = nextTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (nextTime.toDateString() === nowDate.toDateString()) {
      return `Today at ${timeStr}`;
    }
    const tomorrow = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 1);
    if (nextTime.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeStr}`;
    }
    return `${nextTime.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  });

  getPriorityClasses(priority: Priority): string {
    switch (priority) {
      case 'urgent': return 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300';
      case 'high': return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300';
      case 'medium': return 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300';
      case 'low': default: return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300';
    }
  }

  formatRepeatType(type: string): string {
    switch (type) {
      case 'yearly_bs': return 'Annual (BS)';
      case 'yearly_ad': return 'Annual (AD)';
      default: return type;
    }
  }
}

