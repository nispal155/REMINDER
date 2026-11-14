import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService } from '../../core/services/calendar.service';
import { ReminderService } from '../reminders/reminder.service';
import { NepaliCalendarService } from '../../core/services/nepali-calendar.service';
import { MonthViewComponent } from './components/month-view/month-view.component';
import { WeekViewComponent } from './components/week-view/week-view.component';
import { DayViewComponent } from './components/day-view/day-view.component';
import { YearViewComponent } from './components/year-view/year-view.component';
import { ReminderFormComponent } from '../reminders/components/reminder-form/reminder-form.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { CalendarDayCell, CalendarSystem, CalendarViewMode } from '../../core/models/calendar.model';
import { Reminder } from '../../core/models/reminder.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MonthViewComponent,
    WeekViewComponent,
    DayViewComponent,
    YearViewComponent,
    ReminderFormComponent,
    ModalComponent,
    ButtonComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Top Calendar Control Toolbar -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        
        <!-- Navigation & Header Title -->
        <div class="flex items-center space-x-2 sm:space-x-3">
          <!-- Prev Year button -->
          <button
            type="button"
            (click)="calendarService.prevYear()"
            class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Previous Year"
          >
            «
          </button>

          <!-- Prev Month button -->
          <button
            type="button"
            (click)="calendarService.prevMonth()"
            class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Previous Month"
          >
            ‹
          </button>

          <!-- Title -->
          <div class="px-2 text-center min-w-[170px] sm:min-w-[210px]">
            <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {{ calendarService.headerTitle() }}
            </h2>
          </div>

          <!-- Next Month button -->
          <button
            type="button"
            (click)="calendarService.nextMonth()"
            class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Next Month"
          >
            ›
          </button>

          <!-- Next Year button -->
          <button
            type="button"
            (click)="calendarService.nextYear()"
            class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Next Year"
          >
            »
          </button>

          <!-- Today Button -->
          <app-button
            variant="outline"
            size="sm"
            (clicked)="onGoToToday()"
          >
            Today
          </app-button>
        </div>

        <!-- System & View Toggles -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Calendar System Selector (BS / AD / Dual) -->
          <div class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              (click)="calendarService.setSystem('DUAL')"
              [class.bg-white]="calendarService.calendarSystem() === 'DUAL'"
              [class.dark:bg-slate-700]="calendarService.calendarSystem() === 'DUAL'"
              [class.text-indigo-600]="calendarService.calendarSystem() === 'DUAL'"
              [class.dark:text-indigo-400]="calendarService.calendarSystem() === 'DUAL'"
              [class.shadow-sm]="calendarService.calendarSystem() === 'DUAL'"
              class="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              Dual
            </button>
            <button
              type="button"
              (click)="calendarService.setSystem('BS')"
              [class.bg-white]="calendarService.calendarSystem() === 'BS'"
              [class.dark:bg-slate-700]="calendarService.calendarSystem() === 'BS'"
              [class.text-indigo-600]="calendarService.calendarSystem() === 'BS'"
              [class.dark:text-indigo-400]="calendarService.calendarSystem() === 'BS'"
              [class.shadow-sm]="calendarService.calendarSystem() === 'BS'"
              class="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              🇳🇵 BS
            </button>
            <button
              type="button"
              (click)="calendarService.setSystem('AD')"
              [class.bg-white]="calendarService.calendarSystem() === 'AD'"
              [class.dark:bg-slate-700]="calendarService.calendarSystem() === 'AD'"
              [class.text-indigo-600]="calendarService.calendarSystem() === 'AD'"
              [class.dark:text-indigo-400]="calendarService.calendarSystem() === 'AD'"
              [class.shadow-sm]="calendarService.calendarSystem() === 'AD'"
              class="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              🌐 AD
            </button>
          </div>

          <!-- View Mode (Month / Week / Day / Year) -->
          <div class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold no-print">
            <button
              type="button"
              (click)="calendarService.setViewMode('month')"
              [class.bg-white]="calendarService.viewMode() === 'month'"
              [class.dark:bg-slate-700]="calendarService.viewMode() === 'month'"
              [class.text-indigo-600]="calendarService.viewMode() === 'month'"
              [class.dark:text-indigo-400]="calendarService.viewMode() === 'month'"
              [class.shadow-sm]="calendarService.viewMode() === 'month'"
              class="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              Month
            </button>
            <button
              type="button"
              (click)="calendarService.setViewMode('week')"
              [class.bg-white]="calendarService.viewMode() === 'week'"
              [class.dark:bg-slate-700]="calendarService.viewMode() === 'week'"
              [class.text-indigo-600]="calendarService.viewMode() === 'week'"
              [class.dark:text-indigo-400]="calendarService.viewMode() === 'week'"
              [class.shadow-sm]="calendarService.viewMode() === 'week'"
              class="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              Week
            </button>
            <button
              type="button"
              (click)="calendarService.setViewMode('day')"
              [class.bg-white]="calendarService.viewMode() === 'day'"
              [class.dark:bg-slate-700]="calendarService.viewMode() === 'day'"
              [class.text-indigo-600]="calendarService.viewMode() === 'day'"
              [class.dark:text-indigo-400]="calendarService.viewMode() === 'day'"
              [class.shadow-sm]="calendarService.viewMode() === 'day'"
              class="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              Day
            </button>
            <button
              type="button"
              (click)="calendarService.setViewMode('year')"
              [class.bg-white]="calendarService.viewMode() === 'year'"
              [class.dark:bg-slate-700]="calendarService.viewMode() === 'year'"
              [class.text-indigo-600]="calendarService.viewMode() === 'year'"
              [class.dark:text-indigo-400]="calendarService.viewMode() === 'year'"
              [class.shadow-sm]="calendarService.viewMode() === 'year'"
              class="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              Year
            </button>
          </div>

          <!-- Extra Tools: Public Holidays Toggle & Print -->
          <div class="flex items-center space-x-1.5 no-print">
            <button
              type="button"
              (click)="toggleHolidayFilter()"
              [class.bg-rose-100]="calendarService.showHolidaysOnly()"
              [class.text-rose-700]="calendarService.showHolidaysOnly()"
              [class.border-rose-300]="calendarService.showHolidaysOnly()"
              [class.bg-slate-100]="!calendarService.showHolidaysOnly()"
              [class.dark:bg-slate-800]="!calendarService.showHolidaysOnly()"
              [class.text-slate-700]="!calendarService.showHolidaysOnly()"
              [class.dark:text-slate-300]="!calendarService.showHolidaysOnly()"
              class="px-2.5 py-1 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all cursor-pointer"
              title="Filter by gazetted public holidays"
            >
              🇳🇵 Holidays
            </button>

            <button
              type="button"
              (click)="printCalendar()"
              class="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
              title="Print Monthly Calendar (A4)"
            >
              🖨️ Print
            </button>
          </div>
        </div>

      </div>

      <!-- Main Calendar Views -->
      @switch (calendarService.viewMode()) {
        @case ('month') {
          <app-month-view
            [cells]="annotatedMonthGrid()"
            [system]="calendarService.calendarSystem()"
            [selectedAdDate]="activeSelectedDate()"
            (dateSelected)="onSelectCell($event)"
          />
        }
        @case ('week') {
          <app-week-view
            [cells]="annotatedMonthGrid()"
            [system]="calendarService.calendarSystem()"
            [selectedAdDate]="activeSelectedDate()"
            [reminders]="reminderService.allReminders()"
            (dateSelected)="onSelectCell($event)"
          />
        }
        @case ('day') {
          <app-day-view
            [cell]="selectedCellOrToday()"
            [reminders]="remindersForSelectedDate()"
            [system]="calendarService.calendarSystem()"
            (addReminderClicked)="openAddReminderForDate($event)"
          />
        }
        @case ('year') {
          <app-year-view
            [system]="calendarService.calendarSystem()"
            (monthSelected)="onMonthSelectedFromYear($event)"
          />
        }
      }

      <!-- Selected Date Quick Overview Sheet (in Month View) -->
      @if (calendarService.viewMode() === 'month' && selectedCellOrToday()) {
        <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Selected Date Schedule
              </span>
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                🇳🇵 {{ selectedCellOrToday()?.dateBS }} <span class="opacity-40">|</span> 🌐 {{ selectedCellOrToday()?.dateAD }}
              </h3>
              @if (selectedCellOrToday()?.festival) {
                <span class="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 dark:text-amber-400 mt-1">
                  <span>🎉</span>
                  <span>{{ selectedCellOrToday()?.festival?.nameNepali }} ({{ selectedCellOrToday()?.festival?.name }})</span>
                </span>
              }
            </div>

            <app-button
              variant="primary"
              size="sm"
              (clicked)="openAddReminderForDate(selectedCellOrToday()!)"
            >
              + Add Reminder
            </app-button>
          </div>

          <div class="mt-3">
            @if (remindersForSelectedDate().length === 0) {
              <p class="text-xs text-slate-500 dark:text-slate-400 py-2">
                No reminders scheduled on this day.
              </p>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                @for (rem of remindersForSelectedDate(); track rem.id) {
                  <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                    <div class="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        [checked]="rem.status === 'completed'"
                        (change)="reminderService.toggleComplete(rem)"
                        class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <div>
                        <h4 class="text-xs font-bold text-slate-900 dark:text-white" [class.line-through]="rem.status === 'completed'">
                          {{ rem.title }}
                        </h4>
                        <span class="text-[10px] text-slate-500">⏰ {{ rem.time }}</span>
                      </div>
                    </div>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {{ rem.priority }}
                    </span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

    </div>

    <!-- Quick Add Reminder Modal for Date -->
    <app-modal
      [isOpen]="showModal()"
      title="Add Reminder"
      (close)="showModal.set(false)"
    >
      <app-reminder-form
        [initialReminder]="prefilledReminder()"
        (saved)="onSaveReminder($event)"
        (cancelled)="showModal.set(false)"
      />
    </app-modal>
  `
})
export class CalendarComponent implements OnInit {
  readonly calendarService = inject(CalendarService);
  readonly reminderService = inject(ReminderService);
  readonly nepaliCalendar = inject(NepaliCalendarService);

  readonly showModal = signal<boolean>(false);
  readonly prefilledReminder = signal<Reminder | null>(null);

  readonly activeSelectedDate = computed<string>(() => {
    const sel = this.calendarService.selectedCell();
    if (sel) return sel.dateAD;
    return this.nepaliCalendar.formatAdIso(new Date());
  });

  // Annotates calendar cells with live reminder counts
  readonly annotatedMonthGrid = computed<CalendarDayCell[]>(() => {
    const grid = this.calendarService.monthGrid();
    const reminders = this.reminderService.allReminders();

    const counts: Record<string, number> = {};
    for (const r of reminders) {
      if (r.status === 'pending' || r.status === 'snoozed') {
        counts[r.dateAD] = (counts[r.dateAD] || 0) + 1;
      }
    }

    const annotated = grid.map(c => ({
      ...c,
      remindersCount: counts[c.dateAD] || 0
    }));

    if (this.calendarService.showHolidaysOnly()) {
      return annotated.filter(c => c.isGazettedHoliday || c.dayOfWeek === 6);
    }
    return annotated;
  });

  readonly selectedCellOrToday = computed<CalendarDayCell | null>(() => {
    const sel = this.calendarService.selectedCell();
    if (sel) return sel;
    const grid = this.annotatedMonthGrid();
    return grid.find(c => c.isToday) || grid[0] || null;
  });

  readonly remindersForSelectedDate = computed<Reminder[]>(() => {
    const dateAD = this.activeSelectedDate();
    return this.reminderService.allReminders().filter(r => r.dateAD === dateAD);
  });

  ngOnInit() {
    this.onGoToToday();
  }

  onGoToToday() {
    this.calendarService.goToToday();
    const todayCell = this.annotatedMonthGrid().find(c => c.isToday);
    if (todayCell) {
      this.calendarService.selectDate(todayCell);
    }
  }

  onSelectCell(cell: CalendarDayCell) {
    this.calendarService.selectDate(cell);
  }

  onMonthSelectedFromYear(monthIndex: number) {
    const sys = this.calendarService.calendarSystem();
    if (sys === 'AD') {
      const cur = this.calendarService.activeDate();
      this.calendarService.activeDate.set(new Date(cur.getFullYear(), monthIndex - 1, 1));
    } else {
      const bsYear = this.calendarService.activeBsDate().year;
      const adDate = this.nepaliCalendar.bsToAd({ year: bsYear, month: monthIndex, day: 1 });
      this.calendarService.activeDate.set(adDate);
    }
    this.calendarService.setViewMode('month');
  }

  openAddReminderForDate(cell: CalendarDayCell) {
    const dummy: Reminder = {
      id: '',
      title: '',
      dateAD: cell.dateAD,
      dateBS: cell.dateBS,
      time: '10:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      priority: 'medium',
      category: 'Personal',
      repeatType: 'none',
      notificationSchedule: { remindAtTime: true, minutesBefore: [15] },
      status: 'pending',
      createdAt: '',
      updatedAt: ''
    };
    this.prefilledReminder.set(dummy);
    this.showModal.set(true);
  }

  toggleHolidayFilter() {
    this.calendarService.showHolidaysOnly.update(v => !v);
  }

  printCalendar() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  async onSaveReminder(data: any) {
    await this.reminderService.addReminder(data);
    this.showModal.set(false);
    this.prefilledReminder.set(null);
  }
}
