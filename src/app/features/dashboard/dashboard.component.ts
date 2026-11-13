import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReminderService } from '../reminders/reminder.service';
import { NepaliCalendarService } from '../../core/services/nepali-calendar.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ReminderFormComponent } from '../reminders/components/reminder-form/reminder-form.component';
import { SnoozeModalComponent } from '../reminders/components/snooze-modal/snooze-modal.component';
import { Reminder, Priority, SnoozeDuration } from '../../core/models/reminder.model';
import { FestivalInfo } from '../../core/models/calendar.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    ButtonComponent,
    ModalComponent,
    EmptyStateComponent,
    ReminderFormComponent,
    SnoozeModalComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Greeting & Real-time Dual Calendar Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-600/15">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{{ currentTime() }}</span>
            </div>
            
            <h2 class="text-2xl sm:text-3xl font-black tracking-tight">
              {{ greeting() }} 👋
            </h2>

            <!-- Real Dual Calendar Date -->
            <p class="text-indigo-100 text-sm sm:text-base mt-1 flex flex-wrap items-center gap-1.5">
              <span>{{ formattedDate() }}</span>
              <span class="opacity-60">|</span>
              <span class="text-indigo-200 font-bold bg-white/10 px-2 py-0.5 rounded-md">
                🇳🇵 {{ nepaliDateDisplay() }}
              </span>
            </p>

            <!-- Today's Festival Tag (if any) -->
            @if (todayFestival()) {
              <div class="inline-flex items-center space-x-1.5 mt-2.5 px-3 py-1 rounded-xl bg-amber-400/20 backdrop-blur-md border border-amber-300/40 text-amber-200 text-xs font-bold">
                <span>🎉 Today:</span>
                <span>{{ todayFestival()?.nameNepali }} ({{ todayFestival()?.name }})</span>
              </div>
            }
          </div>

          <div class="flex items-center space-x-3">
            <app-button
              variant="secondary"
              size="md"
              (clicked)="openAddModal.set(true)"
            >
              <span class="mr-1.5 font-bold">+</span> Add Reminder
            </app-button>
          </div>
        </div>

        <!-- Decorative background elements -->
        <div class="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div class="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none"></div>
      </div>

      <!-- Quick Metric Counters -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <!-- Due Today -->
        <app-card>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Due Today</span>
            <div class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
              📅
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {{ reminderService.dueToday().length }}
            </span>
            <span class="text-xs text-indigo-600 dark:text-indigo-400 font-bold">Active</span>
          </div>
        </app-card>

        <!-- Overdue -->
        <app-card>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Overdue</span>
            <div class="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center text-sm font-bold">
              ⚠️
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span
              class="text-2xl sm:text-3xl font-black"
              [class.text-rose-600]="reminderService.overdue().length > 0"
              [class.text-slate-900]="reminderService.overdue().length === 0"
              [class.dark:text-white]="reminderService.overdue().length === 0"
            >
              {{ reminderService.overdue().length }}
            </span>
            <span class="text-xs text-rose-500 font-bold">Action Needed</span>
          </div>
        </app-card>

        <!-- Upcoming -->
        <app-card>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Upcoming</span>
            <div class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
              ⏳
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {{ reminderService.upcoming().length }}
            </span>
            <span class="text-xs text-blue-500 font-bold">Scheduled</span>
          </div>
        </app-card>

        <!-- Completed -->
        <app-card>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
              ✓
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {{ reminderService.completed().length }}
            </span>
            <span class="text-xs text-emerald-500 font-bold">Archived</span>
          </div>
        </app-card>
      </div>

      <!-- Overdue Warning Callout (if any) -->
      @if (reminderService.overdue().length > 0) {
        <div class="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 p-4 sm:p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-rose-800 dark:text-rose-300 flex items-center space-x-2">
              <span>⚠️</span>
              <span>Overdue Reminders ({{ reminderService.overdue().length }})</span>
            </h3>
          </div>
          <div class="space-y-2">
            @for (reminder of reminderService.overdue(); track reminder.id) {
              <div class="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 shadow-sm">
                <div class="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    [checked]="reminder.status === 'completed'"
                    (change)="reminderService.toggleComplete(reminder)"
                    class="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ reminder.title }}</h4>
                    <p class="text-xs text-rose-500">Due: {{ reminder.dateBS }} ({{ reminder.dateAD }}) at {{ reminder.time }}</p>
                  </div>
                </div>

                <div class="flex items-center space-x-1.5">
                  <button
                    type="button"
                    (click)="openSnooze(reminder)"
                    class="px-2 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
                  >
                    💤 Snooze
                  </button>
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                    {{ reminder.priority }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Today's Reminders Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Today's Reminders</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ reminderService.dueToday().length }}
            </span>
          </h3>

          <button
            type="button"
            (click)="openAddModal.set(true)"
            class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            + Add New
          </button>
        </div>

        @if (reminderService.dueToday().length === 0) {
          <app-empty-state
            icon="🎉"
            title="All clear for today!"
            description="You don't have any pending reminders scheduled for today."
            actionLabel="+ Create Reminder"
            (actionClicked)="openAddModal.set(true)"
          />
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            @for (reminder of reminderService.dueToday(); track reminder.id) {
              <div
                class="flex items-start justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-900/50"
              >
                <div class="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    [checked]="reminder.status === 'completed'"
                    (change)="reminderService.toggleComplete(reminder)"
                    class="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <h4
                      class="text-sm font-bold text-slate-900 dark:text-white"
                      [class.line-through]="reminder.status === 'completed'"
                      [class.opacity-50]="reminder.status === 'completed'"
                    >
                      {{ reminder.title }}
                    </h4>
                    @if (reminder.description) {
                      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {{ reminder.description }}
                      </p>
                    }
                    <div class="flex items-center space-x-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>⏰ {{ reminder.time }}</span>
                      <span>•</span>
                      <span class="capitalize px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {{ reminder.category }}
                      </span>
                      @if (reminder.status === 'snoozed') {
                        <span>•</span>
                        <span class="text-amber-600 dark:text-amber-400 font-bold">💤 Snoozed</span>
                      }
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-1">
                  <button
                    type="button"
                    (click)="openSnooze(reminder)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer text-xs"
                    title="Snooze"
                  >
                    💤
                  </button>

                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                    [ngClass]="getPriorityClasses(reminder.priority)"
                  >
                    {{ reminder.priority }}
                  </span>
                </div>
              </div>
            }
          </div>
        }
      </div>

    </div>

    <!-- Quick Add Reminder Modal -->
    <app-modal
      [isOpen]="openAddModal()"
      title="Create Reminder"
      (close)="openAddModal.set(false)"
    >
      <app-reminder-form
        (saved)="onSaveReminder($event)"
        (cancelled)="openAddModal.set(false)"
      />
    </app-modal>

    <!-- Snooze Modal -->
    <app-snooze-modal
      [isOpen]="showSnoozeModal()"
      [reminder]="snoozeTarget()"
      (snoozed)="onApplySnooze($event)"
      (cancelled)="showSnoozeModal.set(false)"
    />
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly reminderService = inject(ReminderService);
  private readonly nepaliCalendar = inject(NepaliCalendarService);

  readonly openAddModal = signal<boolean>(false);
  readonly currentTime = signal<string>('');
  readonly formattedDate = signal<string>('');
  readonly nepaliDateDisplay = signal<string>('');
  readonly greeting = signal<string>('Good Day');
  readonly todayFestival = signal<FestivalInfo | null>(null);

  readonly showSnoozeModal = signal<boolean>(false);
  readonly snoozeTarget = signal<Reminder | null>(null);

  private clockInterval: any;

  ngOnInit() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private updateClock() {
    const now = new Date();
    const hours = now.getHours();

    if (hours < 12) {
      this.greeting.set('Good Morning');
    } else if (hours < 17) {
      this.greeting.set('Good Afternoon');
    } else if (hours < 21) {
      this.greeting.set('Good Evening');
    } else {
      this.greeting.set('Good Night');
    }

    this.currentTime.set(
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );

    this.formattedDate.set(
      now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
    );

    // Compute real BS date
    const bs = this.nepaliCalendar.adToBs(now);
    this.nepaliDateDisplay.set(this.nepaliCalendar.formatBsPretty(bs) + ' BS');

    // Check festival
    const fest = this.nepaliCalendar.getFestival(bs);
    this.todayFestival.set(fest || null);
  }

  async onSaveReminder(data: any) {
    await this.reminderService.addReminder(data);
    this.openAddModal.set(false);
  }

  openSnooze(reminder: Reminder) {
    this.snoozeTarget.set(reminder);
    this.showSnoozeModal.set(true);
  }

  async onApplySnooze(event: { duration: SnoozeDuration; customIsoTime?: string }) {
    const r = this.snoozeTarget();
    if (r) {
      await this.reminderService.snoozeReminder(r, event.duration, event.customIsoTime);
    }
    this.showSnoozeModal.set(false);
    this.snoozeTarget.set(null);
  }

  getPriorityClasses(priority: Priority): string {
    switch (priority) {
      case 'urgent': return 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300';
      case 'high': return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300';
      case 'medium': return 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300';
      case 'low': default: return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300';
    }
  }
}
