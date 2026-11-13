import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BS_MONTHS, AD_MONTHS, CalendarSystem } from '../../../../core/models/calendar.model';

@Component({
  selector: 'app-year-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      @for (m of monthsList; track m.index) {
        <div
          (click)="monthSelected.emit(m.index)"
          class="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group text-center"
        >
          <div class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Month {{ m.index }}
          </div>
          <h4 class="text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {{ m.name }}
          </h4>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ m.subName }}
          </p>
        </div>
      }
    </div>
  `
})
export class YearViewComponent {
  system = input<CalendarSystem>('DUAL');
  monthSelected = output<number>();

  get monthsList() {
    if (this.system() === 'AD') {
      return AD_MONTHS.map((name, i) => ({
        index: i + 1,
        name,
        subName: `AD Month ${i + 1}`
      }));
    } else {
      return BS_MONTHS.map(m => ({
        index: m.monthIndex,
        name: `${m.nameEn} (${m.nameNp})`,
        subName: `BS Month ${m.monthIndex}`
      }));
    }
  }
}

