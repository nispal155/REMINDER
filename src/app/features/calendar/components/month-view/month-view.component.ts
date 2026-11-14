import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarDayCell, CalendarSystem, WEEKDAYS } from '../../../../core/models/calendar.model';

@Component({
  selector: 'app-month-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <!-- Weekday headers -->
      <div class="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-center py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400">
        @for (day of weekdays; track day) {
          <div [class.text-rose-500]="day === 'Sat'">{{ day }}</div>
        }
      </div>

      <!-- Month days grid -->
      <div class="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
        @for (cell of cells(); track cell.dateAD) {
          <div
            (click)="dateSelected.emit(cell)"
            class="min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 transition-all relative cursor-pointer group hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20"
            [class.bg-slate-50/50]="!cell.isCurrentMonth"
            [class.dark:bg-slate-950/40]="!cell.isCurrentMonth"
            [class.opacity-45]="!cell.isCurrentMonth"
            [class.ring-2]="cell.dateAD === selectedAdDate()"
            [class.ring-indigo-600]="cell.dateAD === selectedAdDate()"
            [class.bg-indigo-50/60]="cell.dateAD === selectedAdDate()"
            [class.dark:bg-indigo-950/30]="cell.dateAD === selectedAdDate()"
          >
            <!-- Day Numbers Header -->
            <div class="flex items-start justify-between">
              <!-- Primary Date based on active system -->
              <span
                class="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full text-xs sm:text-sm font-bold transition-colors"
                [class.bg-indigo-600]="cell.isToday"
                [class.text-white]="cell.isToday"
                [class.shadow-md]="cell.isToday"
                [class.text-slate-900]="!cell.isToday && !cell.isGazettedHoliday && cell.dayOfWeek !== 6"
                [class.dark:text-white]="!cell.isToday && !cell.isGazettedHoliday && cell.dayOfWeek !== 6"
                [class.text-rose-600]="(cell.dayOfWeek === 6 || cell.isGazettedHoliday) && !cell.isToday"
              >
                {{ system() === 'AD' ? cell.adDate.day : cell.bsDate.day }}
              </span>

              <!-- Secondary Date Badge & Tithi -->
              <div class="text-right">
                <span class="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                  {{ system() === 'AD' ? cell.bsDate.day : cell.adDate.day }}
                </span>
                @if (cell.tithi) {
                  <span class="text-[9px] text-amber-600 dark:text-amber-400/90 font-medium block leading-none truncate max-w-[48px]">
                    {{ cell.tithi }}
                  </span>
                }
              </div>
            </div>

            <!-- Festival Badge (if any) -->
            @if (cell.festival) {
              <div
                class="mt-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold truncate bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60"
                [title]="cell.festival.name"
              >
                {{ cell.festival.nameNepali || cell.festival.name }}
              </div>
            }

            <!-- Reminder indicators -->
            @if (cell.remindersCount > 0) {
              <div class="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[10px]">
                <span class="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                  <span>{{ cell.remindersCount }}</span>
                </span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class MonthViewComponent {
  cells = input.required<CalendarDayCell[]>();
  system = input<CalendarSystem>('DUAL');
  selectedAdDate = input<string>('');

  dateSelected = output<CalendarDayCell>();

  readonly weekdays = WEEKDAYS;
}

