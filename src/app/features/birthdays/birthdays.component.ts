import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BirthdayService } from './birthday.service';
import { NepaliCalendarService } from '../../core/services/nepali-calendar.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RelationshipType, MilestoneType, BirthdayWithCountdown } from '../../core/models/birthday.model';
import { BS_MONTHS } from '../../core/models/calendar.model';

@Component({
  selector: 'app-birthdays',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent, ModalComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Birthdays & Anniversaries</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track special days with age milestones and Nepali BS ↔ English AD calendar support
          </p>
        </div>
        <app-button variant="primary" size="sm" (clicked)="openCreateModal()">
          + Add Milestone
        </app-button>
      </div>

      <!-- List -->
      @if (birthdayService.birthdaysWithCountdown().length === 0) {
        <app-empty-state
          icon="🎂"
          title="No milestones saved yet"
          description="Keep track of friends and family birthdays or anniversaries with offline notifications."
          actionLabel="+ Add First Birthday"
          (actionClicked)="openCreateModal()"
        />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          @for (item of birthdayService.birthdaysWithCountdown(); track item.id) {
            <app-card [interactive]="true">
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg border"
                    [ngClass]="item.type === 'anniversary'
                      ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-200/60 dark:border-purple-800/60 text-purple-600'
                      : 'bg-pink-50 dark:bg-pink-950/70 border-pink-200/60 dark:border-pink-800/60 text-pink-600'"
                  >
                    {{ item.type === 'anniversary' ? '💍' : '🎂' }}
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span>{{ item.name }}</span>
                    </h3>
                    
                    <!-- Milestone info -->
                    <div class="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span class="capitalize">{{ item.relationship }}</span>
                      @if (item.currentAge) {
                        <span>•</span>
                        <span class="font-semibold text-indigo-600 dark:text-indigo-400">Turning {{ item.currentAge }}</span>
                      } @else if (item.milestoneYears) {
                        <span>•</span>
                        <span class="font-semibold text-purple-600 dark:text-purple-400">{{ item.milestoneYears }}th Year</span>
                      }
                    </div>
                  </div>
                </div>

                <!-- Delete -->
                <button
                  type="button"
                  (click)="birthdayService.deleteBirthday(item.id)"
                  class="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <!-- Dates & Countdown Footer -->
              <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div class="flex items-center space-x-1 font-medium text-slate-600 dark:text-slate-300 text-[11px]">
                  <span>🇳🇵 {{ item.dateBS }}</span>
                  <span class="opacity-50">/</span>
                  <span>🌐 {{ item.dateAD }}</span>
                </div>

                <!-- Countdown Pill -->
                @if (item.isToday) {
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 animate-pulse">
                    Today! 🎂
                  </span>
                } @else if (item.isTomorrow) {
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                    Tomorrow
                  </span>
                } @else {
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                    {{ item.daysRemaining }} days left
                  </span>
                }
              </div>

              @if (item.notes) {
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  {{ item.notes }}
                </p>
              }
            </app-card>
          }
        </div>
      }
    </div>

    <!-- Add Milestone Modal -->
    <app-modal
      [isOpen]="showModal()"
      title="Add Birthday or Anniversary"
      (close)="showModal.set(false)"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        
        <!-- Type Selection -->
        <div class="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            (click)="setType('birthday')"
            [class.bg-white]="form.get('type')?.value === 'birthday'"
            [class.dark:bg-slate-900]="form.get('type')?.value === 'birthday'"
            [class.text-indigo-600]="form.get('type')?.value === 'birthday'"
            [class.shadow-sm]="form.get('type')?.value === 'birthday'"
            class="py-1.5 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            🎂 Birthday
          </button>
          <button
            type="button"
            (click)="setType('anniversary')"
            [class.bg-white]="form.get('type')?.value === 'anniversary'"
            [class.dark:bg-slate-900]="form.get('type')?.value === 'anniversary'"
            [class.text-purple-600]="form.get('type')?.value === 'anniversary'"
            [class.shadow-sm]="form.get('type')?.value === 'anniversary'"
            class="py-1.5 text-xs font-bold rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            💍 Anniversary
          </button>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {{ form.get('type')?.value === 'anniversary' ? 'Event / Couple Name *' : "Person's Name *" }}
          </label>
          <input
            type="text"
            formControlName="name"
            placeholder="e.g. Maya Shrestha, Mom & Dad"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Calendar Input System
            </label>
            <div class="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                (click)="setCalendarMode('BS')"
                [class.bg-white]="calendarMode() === 'BS'"
                [class.dark:bg-slate-900]="calendarMode() === 'BS'"
                [class.text-indigo-600]="calendarMode() === 'BS'"
                class="py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300"
              >
                🇳🇵 BS
              </button>
              <button
                type="button"
                (click)="setCalendarMode('AD')"
                [class.bg-white]="calendarMode() === 'AD'"
                [class.dark:bg-slate-900]="calendarMode() === 'AD'"
                [class.text-indigo-600]="calendarMode() === 'AD'"
                class="py-1 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300"
              >
                🌐 AD
              </button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Relationship
            </label>
            <select
              formControlName="relationship"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            >
              <option value="family">Family</option>
              <option value="friend">Friend</option>
              <option value="spouse">Spouse</option>
              <option value="partner">Partner</option>
              <option value="colleague">Colleague</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <!-- BS Date Controls -->
        @if (calendarMode() === 'BS') {
          <div class="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <label class="block text-[11px] font-medium text-slate-400 mb-1">BS Year</label>
              <select
                formControlName="bsYear"
                (change)="syncFromBs()"
                class="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                @for (y of bsYears; track y) {
                  <option [value]="y">{{ y }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-medium text-slate-400 mb-1">BS Month</label>
              <select
                formControlName="bsMonth"
                (change)="syncFromBs()"
                class="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                @for (m of bsMonths; track m.monthIndex) {
                  <option [value]="m.monthIndex">{{ m.nameEn }} ({{ m.nameNp }})</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-[11px] font-medium text-slate-400 mb-1">BS Day</label>
              <input
                type="number"
                min="1"
                max="32"
                formControlName="bsDay"
                (change)="syncFromBs()"
                class="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        } @else {
          <!-- AD Date Input -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Gregorian Date (AD) *
            </label>
            <input
              type="date"
              formControlName="dateAD"
              (change)="syncFromAd()"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>
        }

        <!-- Dual Equivalent Preview -->
        <div class="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 text-xs text-indigo-700 dark:text-indigo-300 font-medium flex items-center justify-between">
          <span>Equivalent:</span>
          <span>🇳🇵 {{ convertedBsDisplay() }} ↔ 🌐 {{ convertedAdDisplay() }}</span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Gift Ideas
          </label>
          <textarea
            formControlName="notes"
            rows="2"
            placeholder="Gift ideas, favorite flowers, memorable moments..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div class="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <app-button variant="ghost" size="sm" type="button" (clicked)="showModal.set(false)">
            Cancel
          </app-button>
          <app-button variant="primary" size="sm" type="submit" [disabled]="form.invalid">
            Save Milestone
          </app-button>
        </div>
      </form>
    </app-modal>
  `
})
export class BirthdaysComponent implements OnInit {
  readonly birthdayService = inject(BirthdayService);
  private readonly nepaliCalendar = inject(NepaliCalendarService);
  private readonly fb = inject(FormBuilder);

  readonly showModal = signal<boolean>(false);
  readonly calendarMode = signal<'BS' | 'AD'>('BS');
  readonly convertedBsDisplay = signal<string>('');
  readonly convertedAdDisplay = signal<string>('');

  readonly bsMonths = BS_MONTHS;
  readonly bsYears: number[] = [];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    type: ['birthday' as MilestoneType, Validators.required],
    relationship: ['family' as RelationshipType, Validators.required],
    bsYear: [2050, Validators.required],
    bsMonth: [5, Validators.required],
    bsDay: [15, Validators.required],
    dateAD: [new Date().toISOString().split('T')[0], Validators.required],
    notes: ['']
  });

  constructor() {
    for (let y = 1990; y <= 2095; y++) {
      this.bsYears.push(y);
    }
  }

  ngOnInit() {
    const today = new Date();
    const bs = this.nepaliCalendar.adToBs(today);
    this.form.patchValue({
      bsYear: bs.year - 25, // default to ~25 years ago
      bsMonth: bs.month,
      bsDay: bs.day
    });
    this.syncFromBs();
  }

  openCreateModal() {
    this.showModal.set(true);
  }

  setType(type: MilestoneType) {
    this.form.patchValue({ type });
  }

  setCalendarMode(mode: 'BS' | 'AD') {
    this.calendarMode.set(mode);
    if (mode === 'BS') {
      this.syncFromBs();
    } else {
      this.syncFromAd();
    }
  }

  syncFromBs() {
    const y = Number(this.form.get('bsYear')?.value) || 2050;
    const m = Number(this.form.get('bsMonth')?.value) || 1;
    const d = Number(this.form.get('bsDay')?.value) || 1;

    const bsDate = { year: y, month: m, day: d };
    const adDateObj = this.nepaliCalendar.bsToAd(bsDate);
    const adIso = this.nepaliCalendar.formatAdIso(adDateObj);

    this.form.patchValue({ dateAD: adIso }, { emitEvent: false });
    this.convertedAdDisplay.set(adIso);
    this.convertedBsDisplay.set(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  syncFromAd() {
    const adVal = this.form.get('dateAD')?.value;
    if (adVal) {
      const bs = this.nepaliCalendar.adToBs(adVal);
      this.form.patchValue({
        bsYear: bs.year,
        bsMonth: bs.month,
        bsDay: bs.day
      }, { emitEvent: false });
      this.convertedAdDisplay.set(adVal);
      this.convertedBsDisplay.set(this.nepaliCalendar.formatBsIso(bs));
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;
    const val = this.form.value;

    const y = Number(val.bsYear);
    const m = Number(val.bsMonth);
    const d = Number(val.bsDay);
    const dateBS = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dateAD = val.dateAD!;

    await this.birthdayService.addBirthday({
      name: val.name!,
      type: val.type as MilestoneType,
      relationship: val.relationship as RelationshipType,
      calendarMode: this.calendarMode(),
      dateBS,
      dateAD,
      notes: val.notes || undefined
    });

    this.form.patchValue({ name: '', notes: '' });
    this.showModal.set(false);
  }
}
