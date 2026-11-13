import { Component, inject, input, output, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NepaliCalendarService } from '../../../../core/services/nepali-calendar.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  Reminder,
  Priority,
  RepeatType,
  REMINDER_CATEGORIES,
  ReminderCategory,
  CalendarInputMode
} from '../../../../core/models/reminder.model';
import { BS_MONTHS } from '../../../../core/models/calendar.model';

@Component({
  selector: 'app-reminder-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      
      <!-- Title -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Reminder Title *
        </label>
        <input
          type="text"
          formControlName="title"
          placeholder="e.g. Pay electricity bill, Mom's birthday"
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        @if (form.get('title')?.touched && form.get('title')?.invalid) {
          <p class="text-xs text-rose-500 mt-1">Title is required (at least 2 characters)</p>
        }
      </div>

      <!-- Description -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Description / Checklist Notes
        </label>
        <textarea
          formControlName="description"
          rows="2"
          placeholder="Optional notes or details..."
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      <!-- Calendar System Switcher -->
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
        <div class="flex items-center justify-between mb-2.5">
          <label class="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Calendar Input System
          </label>
          <div class="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-700">
            <button
              type="button"
              (click)="setCalendarMode('BS')"
              [class.bg-white]="calendarMode() === 'BS'"
              [class.dark:bg-slate-900]="calendarMode() === 'BS'"
              [class.text-indigo-600]="calendarMode() === 'BS'"
              [class.dark:text-indigo-400]="calendarMode() === 'BS'"
              [class.shadow-sm]="calendarMode() === 'BS'"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              🇳🇵 Nepali (BS)
            </button>
            <button
              type="button"
              (click)="setCalendarMode('AD')"
              [class.bg-white]="calendarMode() === 'AD'"
              [class.dark:bg-slate-900]="calendarMode() === 'AD'"
              [class.text-indigo-600]="calendarMode() === 'AD'"
              [class.dark:text-indigo-400]="calendarMode() === 'AD'"
              [class.shadow-sm]="calendarMode() === 'AD'"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
            >
              🌐 English (AD)
            </button>
          </div>
        </div>

        <!-- BS Date Inputs -->
        @if (calendarMode() === 'BS') {
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">BS Year</label>
              <select
                formControlName="bsYear"
                (change)="onBsDateChanged()"
                class="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white"
              >
                @for (y of bsYears; track y) {
                  <option [value]="y">{{ y }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">BS Month</label>
              <select
                formControlName="bsMonth"
                (change)="onBsDateChanged()"
                class="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white"
              >
                @for (m of bsMonths; track m.monthIndex) {
                  <option [value]="m.monthIndex">{{ m.nameEn }} ({{ m.nameNp }})</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">BS Day</label>
              <select
                formControlName="bsDay"
                (change)="onBsDateChanged()"
                class="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white"
              >
                @for (d of availableBsDays(); track d) {
                  <option [value]="d">{{ d }}</option>
                }
              </select>
            </div>
          </div>
          <p class="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-2">
            Equivalent Gregorian Date: {{ equivalentAdDisplay() }}
          </p>
        } @else {
          <!-- AD Date Input -->
          <div>
            <label class="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">AD Date</label>
            <input
              type="date"
              formControlName="dateAD"
              (change)="onAdDateChanged()"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white"
            />
            <p class="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1.5">
              Equivalent Nepali Date: {{ equivalentBsDisplay() }}
            </p>
          </div>
        }
      </div>

      <!-- Time & Priority -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Time (24h) *
          </label>
          <input
            type="time"
            formControlName="time"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Priority
          </label>
          <select
            formControlName="priority"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <!-- Category & Recurrence -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            formControlName="category"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            @for (cat of categories; track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Recurrence
          </label>
          <select
            formControlName="repeatType"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="none">Once (No Repeat)</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly_ad">Yearly (English AD)</option>
            <option value="yearly_bs">Yearly (Nepali BS - e.g. 15 Bhadra)</option>
          </select>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        <app-button variant="ghost" size="sm" type="button" (clicked)="cancelled.emit()">
          Cancel
        </app-button>
        <app-button variant="primary" size="sm" type="submit" [disabled]="form.invalid">
          {{ initialReminder() ? 'Update Reminder' : 'Save Reminder' }}
        </app-button>
      </div>
    </form>
  `
})
export class ReminderFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly nepaliCalendar = inject(NepaliCalendarService);

  initialReminder = input<Reminder | null>(null);
  saved = output<{
    title: string;
    description?: string;
    calendarMode: CalendarInputMode;
    dateAD: string;
    dateBS: string;
    time: string;
    priority: Priority;
    category: ReminderCategory | string;
    repeatType: RepeatType;
  }>();
  cancelled = output<void>();

  readonly categories = REMINDER_CATEGORIES;
  readonly bsMonths = BS_MONTHS;
  readonly bsYears: number[] = [];
  readonly calendarMode = signal<CalendarInputMode>('BS');

  readonly availableBsDays = signal<number[]>([]);
  readonly equivalentAdDisplay = signal<string>('');
  readonly equivalentBsDisplay = signal<string>('');

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    bsYear: [2081, Validators.required],
    bsMonth: [7, Validators.required],
    bsDay: [28, Validators.required],
    dateAD: [new Date().toISOString().split('T')[0], Validators.required],
    time: ['10:00', Validators.required],
    priority: ['medium' as Priority, Validators.required],
    category: ['Personal' as ReminderCategory | string, Validators.required],
    repeatType: ['none' as RepeatType, Validators.required]
  });

  constructor() {
    for (let y = 2075; y <= 2095; y++) {
      this.bsYears.push(y);
    }
  }

  ngOnInit() {
    const existing = this.initialReminder();
    if (existing) {
      const bsParts = existing.dateBS.split('-').map(Number);
      this.form.patchValue({
        title: existing.title,
        description: existing.description || '',
        bsYear: bsParts[0] || 2081,
        bsMonth: bsParts[1] || 7,
        bsDay: bsParts[2] || 28,
        dateAD: existing.dateAD,
        time: existing.time,
        priority: existing.priority,
        category: existing.category,
        repeatType: existing.repeatType
      });
      if (existing.calendarMode) {
        this.calendarMode.set(existing.calendarMode);
      }
    } else {
      // Initialize with today's live dates
      const today = new Date();
      const bs = this.nepaliCalendar.adToBs(today);
      this.form.patchValue({
        bsYear: bs.year,
        bsMonth: bs.month,
        bsDay: bs.day,
        dateAD: this.nepaliCalendar.formatAdIso(today)
      });
    }

    this.updateDaysInCurrentBsMonth();
    this.syncFromBs();
  }

  setCalendarMode(mode: CalendarInputMode) {
    this.calendarMode.set(mode);
    if (mode === 'BS') {
      this.onBsDateChanged();
    } else {
      this.onAdDateChanged();
    }
  }

  onBsDateChanged() {
    this.updateDaysInCurrentBsMonth();
    this.syncFromBs();
  }

  onAdDateChanged() {
    const adVal = this.form.get('dateAD')?.value;
    if (adVal) {
      const bs = this.nepaliCalendar.adToBs(adVal);
      this.form.patchValue({
        bsYear: bs.year,
        bsMonth: bs.month,
        bsDay: bs.day
      }, { emitEvent: false });
      this.equivalentBsDisplay.set(this.nepaliCalendar.formatBsPretty(bs));
    }
  }

  private updateDaysInCurrentBsMonth() {
    const y = Number(this.form.get('bsYear')?.value) || 2081;
    const m = Number(this.form.get('bsMonth')?.value) || 1;
    const maxDays = this.nepaliCalendar.getDaysInBsMonth(y, m);

    const days: number[] = [];
    for (let d = 1; d <= maxDays; d++) {
      days.push(d);
    }
    this.availableBsDays.set(days);

    const currentDay = Number(this.form.get('bsDay')?.value) || 1;
    if (currentDay > maxDays) {
      this.form.patchValue({ bsDay: maxDays }, { emitEvent: false });
    }
  }

  private syncFromBs() {
    const y = Number(this.form.get('bsYear')?.value) || 2081;
    const m = Number(this.form.get('bsMonth')?.value) || 1;
    const d = Number(this.form.get('bsDay')?.value) || 1;

    const bsDate = { year: y, month: m, day: d };
    const adDateObj = this.nepaliCalendar.bsToAd(bsDate);
    const adIso = this.nepaliCalendar.formatAdIso(adDateObj);

    this.form.patchValue({ dateAD: adIso }, { emitEvent: false });
    this.equivalentAdDisplay.set(this.nepaliCalendar.formatAdPretty(adDateObj));
    this.equivalentBsDisplay.set(this.nepaliCalendar.formatBsPretty(bsDate));
  }

  onSubmit() {
    if (this.form.invalid) return;
    const val = this.form.value;

    const y = Number(val.bsYear);
    const m = Number(val.bsMonth);
    const d = Number(val.bsDay);

    const dateBS = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateAD = val.dateAD!;

    this.saved.emit({
      title: val.title!,
      description: val.description || undefined,
      calendarMode: this.calendarMode(),
      dateAD,
      dateBS,
      time: val.time!,
      priority: val.priority as Priority,
      category: val.category!,
      repeatType: val.repeatType as RepeatType
    });
  }
}
