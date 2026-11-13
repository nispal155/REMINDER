import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDayCell, CalendarSystem } from '../../../../core/models/calendar.model';
import { Reminder } from '../../../../core/models/reminder.model';

@Component({
  selector: 'app-week-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <!-- 7 Days Column Headers -->
      <div class="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 divide-x divide-slate-100 dark:divide-slate-800">
        @for (day of weekDays(); track day.dateAD) {
          <div
            (click)="dateSelected.emit(day)"
            class="p-2 sm:p-3 text-center cursor-pointer transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20"
            [class.bg-indigo-50/70]="day.dateAD === selectedAdDate()"
            [class.dark:bg-indigo-950/40]="day.dateAD === selectedAdDate()"
          >
            <span class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
              {{ formatWeekday(day.dayOfWeek) }}
            </span>
            <div class="mt-1 flex items-center justify-center space-x-1">
              <span
                class="inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold"
                [class.bg-indigo-600]="day.isToday"
                [class.text-white]="day.isToday"
                [class.text-slate-900]="!day.isToday"
                [class.dark:text-white]="!day.isToday"
              >
                {{ system() === 'AD' ? day.adDate.day : day.bsDate.day }}
              </span>
            </div>
            <span class="block text-[10px] text-slate-400 mt-0.5">
              {{ system() === 'AD' ? day.bsDate.day : day.adDate.day }}
            </span>
          </div>
        }
      </div>

      <!-- Weekly Column Schedule -->
      <div class="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800 min-h-[360px] p-2 gap-1 sm:gap-2">
        @for (day of weekDays(); track day.dateAD) {
          <div class="space-y-1.5 min-h-full">
            @for (rem of getRemindersForDate(day.dateAD); track rem.id) {
              <div
                class="p-1.5 rounded-xl border text-[11px] shadow-sm transition-all hover:scale-[1.02]"
                [ngClass]="getPriorityClasses(rem.priority)"
              >
                <div class="font-bold truncate">{{ rem.title }}</div>
                <div class="text-[9px] opacity-75 mt-0.5">⏰ {{ rem.time }}</div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class WeekViewComponent {
  cells = input.required<CalendarDayCell[]>();
  system = input<CalendarSystem>('DUAL');
  selectedAdDate = input<string>('');
  reminders = input<Reminder[]>([]);

  dateSelected = output<CalendarDayCell>();

  // Extract 7 days around the active/selected date from the cells
  readonly weekDays = computed(() => {
    const list = this.cells();
    const sel = this.selectedAdDate();
    let index = list.findIndex(c => c.dateAD === sel);
    if (index === -1) index = list.findIndex(c => c.isToday);
    if (index === -1) index = 0;

    const rowStart = Math.floor(index / 7) * 7;
    return list.slice(rowStart, rowStart + 7);
  });

  getRemindersForDate(dateAD: string): Reminder[] {
    return this.reminders().filter(r => r.dateAD === dateAD);
  }

  formatWeekday(dayOfWeek: number): string {
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return names[dayOfWeek] || '';
  }

  getPriorityClasses(priority: string): string {
    switch (priority) {
      case 'urgent': return 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200';
      case 'high': return 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      case 'medium': return 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default: return 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
    }
  }
}
