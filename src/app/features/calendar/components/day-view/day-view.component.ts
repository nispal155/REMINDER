import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDayCell, CalendarSystem } from '../../../../core/models/calendar.model';
import { Reminder } from '../../../../core/models/reminder.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-day-view',
  standalone: true,
  imports: [CommonModule, ButtonComponent, EmptyStateComponent],
  template: `
    <div class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 sm:p-6 space-y-5">
      
      <!-- Day Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Selected Agenda
            </span>
            @if (cell()?.isToday) {
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                Today
              </span>
            }
          </div>

          <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            🇳🇵 {{ cell()?.dateBS }} <span class="opacity-40">|</span> 🌐 {{ cell()?.dateAD }}
          </h3>

          @if (cell()?.festival) {
            <p class="inline-flex items-center space-x-1.5 mt-2 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <span>🎉</span>
              <span>{{ cell()?.festival?.nameNepali }} ({{ cell()?.festival?.name }})</span>
            </p>
          }
        </div>

        <app-button variant="primary" size="sm" (clicked)="addReminderClicked.emit(cell()!)">
          + Add Reminder on This Day
        </app-button>
      </div>

      <!-- Reminders for this Day -->
      <div class="space-y-3">
        <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">
          Reminders ({{ reminders().length }})
        </h4>

        @if (reminders().length === 0) {
          <app-empty-state
            icon="☀️"
            title="Free schedule"
            description="No reminders are scheduled for this date."
            actionLabel="+ Add Reminder"
            (actionClicked)="addReminderClicked.emit(cell()!)"
          />
        } @else {
          <div class="space-y-2.5">
            @for (rem of reminders(); track rem.id) {
              <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div class="flex items-center space-x-3">
                  <div class="text-sm font-bold px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                    ⏰ {{ rem.time }}
                  </div>
                  <div>
                    <h5 class="text-sm font-bold text-slate-900 dark:text-white">{{ rem.title }}</h5>
                    @if (rem.description) {
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ rem.description }}</p>
                    }
                  </div>
                </div>

                <span class="text-xs font-semibold px-2.5 py-1 rounded-full capitalize bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                  {{ rem.category }}
                </span>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class DayViewComponent {
  cell = input<CalendarDayCell | null>(null);
  reminders = input<Reminder[]>([]);
  system = input<CalendarSystem>('DUAL');

  addReminderClicked = output<CalendarDayCell>();
}

