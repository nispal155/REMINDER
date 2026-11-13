import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from './event.service';
import { ReminderService } from '../reminders/reminder.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CardComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Calendar</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">English (AD) and Nepali (BS) schedule view</p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Phase 1 Foundation
          </span>
        </div>
      </div>

      <!-- Dual Calendar Highlight Banner -->
      <app-card>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2">
          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              Active Dual System
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Gregorian (AD) & Bikram Sambat (BS)
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              IndexedDB stores dual dates on all records (<code class="text-indigo-600 dark:text-indigo-400">dateAD</code> and <code class="text-indigo-600 dark:text-indigo-400">dateBS</code>). The complete conversion library and interactive monthly matrix are loaded in Phase 2.
            </p>
          </div>
          <div class="text-center sm:text-right shrink-0">
            <div class="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">2081 BS</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Kartik - Mangsir</div>
          </div>
        </div>
      </app-card>

      <!-- Calendar Events & Scheduled Reminders -->
      <div class="space-y-3">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Upcoming Calendar Reminders</h3>
        @if (reminderService.upcoming().length === 0) {
          <app-empty-state
            icon="📅"
            title="No upcoming events"
            description="Your future calendar slots are currently empty."
          />
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (item of reminderService.upcoming(); track item.id) {
              <app-card [interactive]="true">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {{ item.dateAD }} • {{ item.time }}
                    </span>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-1">{{ item.title }}</h4>
                    @if (item.description) {
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ item.description }}</p>
                    }
                  </div>
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {{ item.category }}
                  </span>
                </div>
              </app-card>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class CalendarComponent {
  readonly eventService = inject(EventService);
  readonly reminderService = inject(ReminderService);
}
