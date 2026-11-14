import { Component, inject, input, output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { NepaliCalendarService } from '../../../../core/services/nepali-calendar.service';
import { VoiceRecognitionService } from '../../../../core/services/voice-recognition.service';
import { NlpParserService } from '../../../../core/services/nlp-parser.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import {
  Reminder,
  Priority,
  RepeatType,
  REMINDER_CATEGORIES,
  ReminderCategory,
  CalendarInputMode,
  Subtask
} from '../../../../core/models/reminder.model';
import { BS_MONTHS } from '../../../../core/models/calendar.model';

@Component({
  selector: 'app-reminder-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      
      <!-- Voice Input Banner (if listening) -->
      @if (voiceService.isListening()) {
        <div class="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between animate-pulse">
          <div class="flex items-center space-x-2">
            <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <span class="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Listening... Speak your reminder (e.g. "Doctor visit tomorrow 5pm @health")
            </span>
          </div>
          <button
            type="button"
            (click)="voiceService.stopListening()"
            class="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            Stop
          </button>
        </div>
      }

      <!-- Title + Voice Dictation Button -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Reminder Title *
          </label>
          @if (voiceService.isSupported()) {
            <button
              type="button"
              (click)="startVoiceDictation()"
              [class.text-rose-600]="voiceService.isListening()"
              [class.bg-rose-50]="voiceService.isListening()"
              class="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer border border-indigo-200 dark:border-indigo-800 transition-colors"
              title="Speak reminder"
            >
              <span>🎙️</span>
              <span>{{ voiceService.isListening() ? 'Listening...' : 'Voice Dictate' }}</span>
            </button>
          }
        </div>
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

      <!-- Subtasks / Checklist Builder -->
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          ☑️ Subtasks / Checklist
        </label>
        
        <div class="flex items-center space-x-2">
          <input
            type="text"
            [(ngModel)]="newSubtaskText"
            [ngModelOptions]="{standalone: true}"
            (keydown.enter)="$event.preventDefault(); addSubtaskItem()"
            placeholder="Add subtask step..."
            class="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
          <button
            type="button"
            (click)="addSubtaskItem()"
            class="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
          >
            + Add
          </button>
        </div>

        @if (subtasks().length > 0) {
          <div class="space-y-1 pt-1">
            @for (st of subtasks(); track st.id; let i = $index) {
              <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <div class="flex items-center space-x-2 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    [checked]="st.completed"
                    (change)="toggleSubtaskLocal(st.id)"
                    class="rounded text-indigo-600 cursor-pointer"
                  />
                  <span [class.line-through]="st.completed" [class.opacity-50]="st.completed" class="text-slate-800 dark:text-slate-200 truncate">
                    {{ st.title }}
                  </span>
                </div>
                <button
                  type="button"
                  (click)="removeSubtaskItem(i)"
                  class="text-rose-500 hover:text-rose-700 text-xs font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        }
      </div>

      <!-- Context Tags (@home, @office, @market, etc.) -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          🏷️ Context Tags
        </label>
        <div class="flex flex-wrap gap-1.5 mb-2">
          @for (preset of presetTags; track preset) {
            <button
              type="button"
              (click)="toggleTag(preset)"
              [class.bg-indigo-600]="hasTag(preset)"
              [class.text-white]="hasTag(preset)"
              [class.bg-slate-100]="!hasTag(preset)"
              [class.dark:bg-slate-800]="!hasTag(preset)"
              [class.text-slate-700]="!hasTag(preset)"
              [class.dark:text-slate-300]="!hasTag(preset)"
              class="px-2 py-0.5 text-xs font-medium rounded-lg cursor-pointer transition-all border border-slate-200 dark:border-slate-700"
            >
              {{ preset }}
            </button>
          }
        </div>
      </div>

      <!-- Financial / Bill Tracker Info -->
      <div class="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2">
        <label class="block text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
          💰 Expense / Bill Amount (Optional)
        </label>
        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2">
            <input
              type="number"
              formControlName="amount"
              placeholder="e.g. 1500"
              class="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <select
              formControlName="currency"
              class="w-full px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value="NPR">NPR (Rs)</option>
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>
        <div class="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            formControlName="isPaid"
            id="isPaidCheck"
            class="rounded text-emerald-600 cursor-pointer"
          />
          <label for="isPaidCheck" class="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Marked as Paid
          </label>
        </div>
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

      <!-- Multiple Notification Schedule -->
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          🔔 Notification Alert Times (Multi-select)
        </label>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          Choose when to be alerted. You can select multiple lead times (e.g. 1 day before + 1 hour before + at time).
        </p>

        <div class="flex flex-wrap gap-1.5 pt-1">
          @for (lead of presetLeadTimes; track lead.minutes) {
            <button
              type="button"
              (click)="toggleLeadTime(lead.minutes)"
              [class.bg-indigo-600]="isLeadTimeSelected(lead.minutes)"
              [class.text-white]="isLeadTimeSelected(lead.minutes)"
              [class.shadow-sm]="isLeadTimeSelected(lead.minutes)"
              [class.bg-white]="!isLeadTimeSelected(lead.minutes)"
              [class.dark:bg-slate-800]="!isLeadTimeSelected(lead.minutes)"
              [class.text-slate-700]="!isLeadTimeSelected(lead.minutes)"
              [class.dark:text-slate-300]="!isLeadTimeSelected(lead.minutes)"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-700 hover:border-indigo-400"
            >
              {{ lead.label }}
            </button>
          }
        </div>
      </div>

      <!-- Attachments: Images, Documents, Bills -->
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
        <div class="flex items-center justify-between">
          <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            📎 Attachments (Images, PDFs, Documents, Bills)
          </label>
          <label class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 cursor-pointer">
            + Add Files
            <input type="file" multiple (change)="onFilesSelected($event)" class="hidden" />
          </label>
        </div>
        <p class="text-[11px] text-slate-500 dark:text-slate-400">
          Saved offline in IndexedDB and backed up to Google Drive when online.
        </p>

        @if (selectedFiles().length > 0) {
          <div class="space-y-1.5 pt-1">
            @for (file of selectedFiles(); track file.name; let i = $index) {
              <div class="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                <div class="flex items-center space-x-2 truncate">
                  <span>📄</span>
                  <span class="font-medium text-slate-800 dark:text-slate-200 truncate">{{ file.name }}</span>
                  <span class="text-[10px] text-slate-400">({{ formatFileSize(file.size) }})</span>
                </div>
                <button
                  type="button"
                  (click)="removeFile(i)"
                  class="text-rose-500 hover:text-rose-700 p-1 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>
            }
          </div>
        }
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
  readonly voiceService = inject(VoiceRecognitionService);
  private readonly nlpParser = inject(NlpParserService);

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
    subtasks?: Subtask[];
    tags?: string[];
    amount?: number;
    currency?: string;
    isPaid?: boolean;
    notificationSchedule?: {
      remindAtTime: boolean;
      minutesBefore: number[];
    };
    files?: File[];
  }>();
  cancelled = output<void>();

  readonly categories = REMINDER_CATEGORIES;
  readonly bsMonths = BS_MONTHS;
  readonly bsYears: number[] = [];
  readonly calendarMode = signal<CalendarInputMode>('BS');
  readonly presetLeadTimes = [
    { label: 'At event time', minutes: 0 },
    { label: '5m before', minutes: 5 },
    { label: '10m before', minutes: 10 },
    { label: '15m before', minutes: 15 },
    { label: '30m before', minutes: 30 },
    { label: '1 hour before', minutes: 60 },
    { label: '1 day before', minutes: 1440 },
    { label: '7 days before', minutes: 10080 }
  ];
  readonly selectedLeadTimes = signal<number[]>([0, 15]);

  readonly availableBsDays = signal<number[]>([]);
  readonly equivalentAdDisplay = signal<string>('');
  readonly equivalentBsDisplay = signal<string>('');
  readonly selectedFiles = signal<File[]>([]);

  // Subtasks & Context Tags
  newSubtaskText = '';
  readonly subtasks = signal<Subtask[]>([]);
  readonly tags = signal<string[]>([]);
  readonly presetTags = ['@home', '@office', '@market', '@bank', '@clinic', '@finance'];

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
    repeatType: ['none' as RepeatType, Validators.required],
    amount: [null as number | null],
    currency: ['NPR'],
    isPaid: [false]
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
        repeatType: existing.repeatType,
        amount: existing.amount || null,
        currency: existing.currency || 'NPR',
        isPaid: existing.isPaid ?? false
      });
      if (existing.calendarMode) {
        this.calendarMode.set(existing.calendarMode);
      }
      if (existing.subtasks) {
        this.subtasks.set([...existing.subtasks]);
      }
      if (existing.tags) {
        this.tags.set([...existing.tags]);
      }
      if (existing.notificationSchedule?.minutesBefore) {
        this.selectedLeadTimes.set(existing.notificationSchedule.minutesBefore);
      }
    } else {
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

  async startVoiceDictation(): Promise<void> {
    try {
      const text = await this.voiceService.startListening();
      if (text && text.trim()) {
        const parsed = this.nlpParser.parse(text);
        this.form.patchValue({
          title: parsed.title,
          time: parsed.time,
          priority: parsed.priority,
          category: parsed.category,
          repeatType: parsed.repeatType
        });
        if (parsed.amount) {
          this.form.patchValue({
            amount: parsed.amount,
            currency: parsed.currency || 'NPR'
          });
        }
        if (parsed.tags && parsed.tags.length > 0) {
          this.tags.set(Array.from(new Set([...this.tags(), ...parsed.tags])));
        }
        // Sync dates
        const bsParts = parsed.dateBS.split('-').map(Number);
        this.form.patchValue({
          bsYear: bsParts[0],
          bsMonth: bsParts[1],
          bsDay: bsParts[2],
          dateAD: parsed.dateAD
        });
        this.updateDaysInCurrentBsMonth();
        this.syncFromBs();
      }
    } catch (e) {
      console.warn('Voice recognition error or cancelled:', e);
    }
  }

  addSubtaskItem(): void {
    if (!this.newSubtaskText.trim()) return;
    this.subtasks.update(list => [
      ...list,
      { id: uuidv4(), title: this.newSubtaskText.trim(), completed: false }
    ]);
    this.newSubtaskText = '';
  }

  toggleSubtaskLocal(id: string): void {
    this.subtasks.update(list =>
      list.map(st => st.id === id ? { ...st, completed: !st.completed } : st)
    );
  }

  removeSubtaskItem(index: number): void {
    this.subtasks.update(list => list.filter((_, i) => i !== index));
  }

  toggleTag(tag: string): void {
    if (this.tags().includes(tag)) {
      this.tags.update(t => t.filter(x => x !== tag));
    } else {
      this.tags.update(t => [...t, tag]);
    }
  }

  hasTag(tag: string): boolean {
    return this.tags().includes(tag);
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

  toggleLeadTime(minutes: number) {
    const current = this.selectedLeadTimes();
    if (current.includes(minutes)) {
      if (current.length > 1) {
        this.selectedLeadTimes.set(current.filter(m => m !== minutes));
      }
    } else {
      this.selectedLeadTimes.set([...current, minutes].sort((a, b) => a - b));
    }
  }

  isLeadTimeSelected(minutes: number): boolean {
    return this.selectedLeadTimes().includes(minutes);
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const added = Array.from(input.files);
      this.selectedFiles.update(files => [...files, ...added]);
      input.value = '';
    }
  }

  removeFile(index: number) {
    this.selectedFiles.update(files => files.filter((_, i) => i !== index));
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      repeatType: val.repeatType as RepeatType,
      subtasks: this.subtasks(),
      tags: this.tags(),
      amount: val.amount ? Number(val.amount) : undefined,
      currency: val.currency || 'NPR',
      isPaid: Boolean(val.isPaid),
      notificationSchedule: {
        remindAtTime: this.selectedLeadTimes().includes(0),
        minutesBefore: this.selectedLeadTimes()
      },
      files: this.selectedFiles()
    });
  }
}
