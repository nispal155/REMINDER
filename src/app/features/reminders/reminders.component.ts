import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReminderService } from './reminder.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Reminder, Priority } from '../../core/models/reminder.model';

type FilterTab = 'all' | 'pending' | 'completed' | 'overdue';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, CardComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <!-- Title & Tabs -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">All Reminders</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage and track your schedule</p>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 max-w-fit">
          <button
            type="button"
            (click)="activeTab.set('all')"
            [class.bg-white]="activeTab() === 'all'"
            [class.dark:bg-slate-700]="activeTab() === 'all'"
            [class.shadow-sm]="activeTab() === 'all'"
            [class.text-indigo-600]="activeTab() === 'all'"
            [class.dark:text-indigo-400]="activeTab() === 'all'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            All ({{ reminderService.allReminders().length }})
          </button>
          <button
            type="button"
            (click)="activeTab.set('pending')"
            [class.bg-white]="activeTab() === 'pending'"
            [class.dark:bg-slate-700]="activeTab() === 'pending'"
            [class.shadow-sm]="activeTab() === 'pending'"
            [class.text-indigo-600]="activeTab() === 'pending'"
            [class.dark:text-indigo-400]="activeTab() === 'pending'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            Pending
          </button>
          <button
            type="button"
            (click)="activeTab.set('completed')"
            [class.bg-white]="activeTab() === 'completed'"
            [class.dark:bg-slate-700]="activeTab() === 'completed'"
            [class.shadow-sm]="activeTab() === 'completed'"
            [class.text-indigo-600]="activeTab() === 'completed'"
            [class.dark:text-indigo-400]="activeTab() === 'completed'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            Completed ({{ reminderService.completed().length }})
          </button>
        </div>
      </div>

      <!-- Reminders List -->
      @if (filteredReminders().length === 0) {
        <app-empty-state
          icon="📋"
          title="No reminders in this view"
          description="Try changing the tab filter or adding a new reminder."
        />
      } @else {
        <div class="space-y-3">
          @for (reminder of filteredReminders(); track reminder.id) {
            <app-card [interactive]="true">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start space-x-3.5">
                  <input
                    type="checkbox"
                    [checked]="reminder.status === 'completed'"
                    (change)="reminderService.toggleComplete(reminder)"
                    class="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <h3
                      class="text-base font-semibold text-slate-900 dark:text-white"
                      [class.line-through]="reminder.status === 'completed'"
                      [class.opacity-50]="reminder.status === 'completed'"
                    >
                      {{ reminder.title }}
                    </h3>
                    @if (reminder.description) {
                      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {{ reminder.description }}
                      </p>
                    }
                    <div class="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-slate-500 dark:text-slate-400">
                      <span class="flex items-center space-x-1">
                        <span>📅</span>
                        <span>{{ reminder.dateAD }}</span>
                      </span>
                      <span>•</span>
                      <span class="flex items-center space-x-1">
                        <span>⏰</span>
                        <span>{{ reminder.time }}</span>
                      </span>
                      <span>•</span>
                      <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {{ reminder.category }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <span
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                    [ngClass]="getPriorityClasses(reminder.priority)"
                  >
                    {{ reminder.priority }}
                  </span>

                  <button
                    type="button"
                    (click)="reminderService.deleteReminder(reminder.id)"
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
          }
        </div>
      }
    </div>
  `
})
export class RemindersComponent {
  readonly reminderService = inject(ReminderService);
  readonly activeTab = signal<FilterTab>('all');

  readonly filteredReminders = computed(() => {
    const tab = this.activeTab();
    const all = this.reminderService.allReminders();
    if (tab === 'completed') {
      return all.filter(r => r.status === 'completed');
    }
    if (tab === 'pending') {
      return all.filter(r => r.status === 'pending' || r.status === 'snoozed');
    }
    if (tab === 'overdue') {
      return this.reminderService.overdue();
    }
    return all;
  });

  getPriorityClasses(priority: Priority): string {
    switch (priority) {
      case 'urgent': return 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300';
      case 'high': return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300';
      case 'medium': return 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300';
      case 'low': default: return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300';
    }
  }
}
