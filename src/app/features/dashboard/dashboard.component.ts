import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReminderService } from '../reminders/reminder.service';
import { NepaliCalendarService } from '../../core/services/nepali-calendar.service';
import { FestivalService, UpcomingFestivalItem } from '../../core/services/festival.service';
import { BirthdayService } from '../birthdays/birthday.service';
import { NlpParserService } from '../../core/services/nlp-parser.service';
import { VoiceRecognitionService } from '../../core/services/voice-recognition.service';
import { SoundService } from '../../core/services/sound.service';
import { ToastService } from '../../core/services/toast.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ReminderFormComponent } from '../reminders/components/reminder-form/reminder-form.component';
import { SnoozeModalComponent } from '../reminders/components/snooze-modal/snooze-modal.component';
import { Reminder, Priority, SnoozeDuration } from '../../core/models/reminder.model';
import { FestivalInfo } from '../../core/models/calendar.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    ModalComponent,
    ReminderFormComponent,
    SnoozeModalComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Greeting & Real-time Dual Calendar Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B2E40] via-[#27465F] to-[#1166B3] p-6 sm:p-8 text-white shadow-xl shadow-[#1166B3]/20 border border-[#365874]">
        <div class="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-[#ABDAF0]/30">
              <span class="w-2 h-2 rounded-full bg-[#7DC0E5] animate-pulse"></span>
              <span class="text-[#ABDAF0]">{{ currentTime() }}</span>
            </div>
            
            <h2 class="text-2xl sm:text-3xl font-black tracking-tight">
              {{ greeting() }} 👋
            </h2>

            <!-- Real Dual Calendar Date -->
            <p class="text-[#ABDAF0] text-sm sm:text-base mt-1 flex flex-wrap items-center gap-1.5 font-medium">
              <span>{{ formattedDate() }}</span>
              <span class="opacity-60 text-white/50">|</span>
              <span class="text-white font-bold bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
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
        <div class="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-[#7DC0E5]/15 blur-2xl pointer-events-none"></div>
        <div class="absolute -left-10 -top-10 w-48 h-48 rounded-full bg-[#1166B3]/25 blur-2xl pointer-events-none"></div>
      </div>

      <!-- Natural Language Quick-Add Bar -->
      <div class="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#27465F] border border-[#D9E4EC] dark:border-[#365874] shadow-sm">
        <form (ngSubmit)="handleQuickAdd()" class="flex items-center gap-2">
          <div class="relative flex-1">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              ⚡
            </span>
            <input
              type="text"
              [(ngModel)]="quickAddInput"
              [ngModelOptions]="{standalone: true}"
              placeholder="Natural Language Quick Add (e.g. 'Pay wifi bill Rs 1500 tomorrow at 6pm @home')"
              class="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D9E4EC] dark:border-[#365874] bg-[#F5F8FC] dark:bg-[#1B2E40] text-sm text-[#142536] dark:text-white placeholder-[#566B7E]/60 dark:placeholder-[#ABDAF0]/50 focus:outline-none focus:ring-2 focus:ring-[#1166B3]"
            />
            @if (voiceService.isSupported()) {
              <button
                type="button"
                (click)="dictateQuickAdd()"
                [class.text-rose-500]="voiceService.isListening()"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#1166B3] cursor-pointer"
                title="Speak to dictate"
              >
                🎙️
              </button>
            }
          </div>
          <app-button variant="primary" size="sm" type="submit" [disabled]="!quickAddInput.trim()">
            Quick Add
          </app-button>
        </form>
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
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completion Rate</span>
            <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold">
              ✓
            </div>
          </div>
          <div class="mt-3 flex items-baseline justify-between">
            <span class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {{ completionRate() }}%
            </span>
            <span class="text-xs text-slate-400 font-medium">
              {{ reminderService.completed().length }}/{{ totalReminders() }}
            </span>
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

      <!-- Category Breakdown Progress Bar -->
      @if (totalReminders() > 0) {
        <app-card>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Productivity by Category</h3>
            <span class="text-xs text-slate-500">{{ totalReminders() }} total items</span>
          </div>

          <div class="space-y-2.5">
            @for (cat of categoryDistribution(); track cat.name) {
              <div class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span class="font-medium text-slate-700 dark:text-slate-300">{{ cat.name }}</span>
                  <span class="text-slate-500 dark:text-slate-400">{{ cat.count }} ({{ cat.percentage }}%)</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    class="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    [style.width.%]="cat.percentage"
                  ></div>
                </div>
              </div>
            }
          </div>
        </app-card>
      }

      <!-- Monthly Expense & Bill Forecast Widget -->
      @if (expenseStats().totalDue > 0) {
        <app-card>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>💰</span>
              <span>Monthly Bill & Expense Forecast</span>
            </h3>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
              {{ expenseStats().paidPercent }}% Paid
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2.5 mb-3 text-center">
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-[11px] text-slate-500 font-medium block">Total Due</span>
              <span class="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Rs {{ expenseStats().totalDue | number }}
              </span>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30">
              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">Paid</span>
              <span class="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400">
                Rs {{ expenseStats().totalPaid | number }}
              </span>
            </div>
            <div class="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30">
              <span class="text-[11px] text-amber-600 dark:text-amber-400 font-medium block">Pending</span>
              <span class="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                Rs {{ expenseStats().totalPending | number }}
              </span>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              class="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              [style.width.%]="expenseStats().paidPercent"
            ></div>
          </div>
        </app-card>
      }

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Active Bill & Payment Reminders -->
        <app-card>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>💳</span>
              <span>Bill & Payment Reminders</span>
            </h3>
            <span class="text-xs text-slate-500">{{ billReminders().length }} active</span>
          </div>

          @if (billReminders().length === 0) {
            <p class="text-xs text-slate-400 italic py-4 text-center">
              No pending bills or payment reminders.
            </p>
          } @else {
            <div class="space-y-2">
              @for (bill of billReminders(); track bill.id) {
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <h4 class="font-bold text-slate-900 dark:text-white">{{ bill.title }}</h4>
                    <p class="text-[11px] text-slate-500">🇳🇵 {{ bill.dateBS }} • ⏰ {{ bill.time }}</p>
                  </div>
                  <button
                    type="button"
                    (click)="reminderService.toggleComplete(bill)"
                    class="px-2 py-1 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 font-semibold cursor-pointer"
                  >
                    ✓ Pay
                  </button>
                </div>
              }
            </div>
          }
        </app-card>

        <!-- Upcoming Nepali Festivals -->
        <app-card>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>🇳🇵</span>
              <span>Upcoming Festivals</span>
            </h3>
            <a routerLink="/calendar" class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              View Calendar →
            </a>
          </div>

          <div class="space-y-2">
            @for (item of upcomingFestivals(); track item.dateBS) {
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-xs">
                <div>
                  <h4 class="font-bold text-amber-900 dark:text-amber-200">
                    {{ item.festival.nameNepali || item.festival.name }}
                  </h4>
                  <p class="text-[11px] text-amber-700/80 dark:text-amber-400">
                    {{ item.dateBS }} ({{ item.festival.name }})
                  </p>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                  {{ item.daysRemaining === 0 ? 'Today! 🎉' : item.daysRemaining + ' days left' }}
                </span>
              </div>
            }
          </div>
        </app-card>

      </div>

      <!-- Today's Reminders Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Today's Reminders</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ reminderService.dueToday().length }}
            </span>
          </h3>
        </div>

        @if (reminderService.dueToday().length === 0) {
          <app-card>
            <div class="text-center py-8">
              <span class="text-4xl">✨</span>
              <h4 class="text-sm font-bold text-slate-900 dark:text-white mt-2">All clear for today!</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">No pending tasks or reminders due today.</p>
            </div>
          </app-card>
        } @else {
          <div class="space-y-2.5">
            @for (reminder of reminderService.dueToday(); track reminder.id) {
              <div class="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div class="flex items-center space-x-3.5">
                  <input
                    type="checkbox"
                    [checked]="reminder.status === 'completed'"
                    (change)="reminderService.toggleComplete(reminder)"
                    class="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ reminder.title }}</h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      ⏰ {{ reminder.time }} • {{ reminder.category }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center space-x-1.5">
                  <button
                    type="button"
                    (click)="openSnooze(reminder)"
                    class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                  >
                    💤 Snooze
                  </button>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
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

    <!-- Quick Add Modal -->
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

    <!-- Snooze Duration Modal -->
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
  private readonly festivalService = inject(FestivalService);
  private readonly birthdayService = inject(BirthdayService);
  private readonly nlpParser = inject(NlpParserService);
  readonly voiceService = inject(VoiceRecognitionService);
  private readonly soundService = inject(SoundService);
  private readonly toast = inject(ToastService);

  quickAddInput = '';

  readonly openAddModal = signal<boolean>(false);
  readonly currentTime = signal<string>('');
  readonly formattedDate = signal<string>('');
  readonly nepaliDateDisplay = signal<string>('');
  readonly greeting = signal<string>('Good Day');
  readonly todayFestival = signal<FestivalInfo | null>(null);

  readonly showSnoozeModal = signal<boolean>(false);
  readonly snoozeTarget = signal<Reminder | null>(null);

  private clockInterval: any;

  readonly totalReminders = computed(() => this.reminderService.allReminders().length);

  readonly expenseStats = computed(() => {
    const list = this.reminderService.allReminders();
    let totalDue = 0;
    let totalPaid = 0;

    for (const r of list) {
      if (r.amount !== undefined && r.amount !== null && r.amount > 0) {
        totalDue += r.amount;
        if (r.isPaid) {
          totalPaid += r.amount;
        }
      }
    }

    const totalPending = Math.max(0, totalDue - totalPaid);
    const paidPercent = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
    return { totalDue, totalPaid, totalPending, paidPercent };
  });

  readonly completionRate = computed(() => {
    const total = this.totalReminders();
    if (total === 0) return 100;
    const completed = this.reminderService.completed().length;
    return Math.round((completed / total) * 100);
  });

  readonly categoryDistribution = computed(() => {
    const list = this.reminderService.allReminders();
    const total = list.length;
    if (total === 0) return [];

    const map = new Map<string, number>();
    for (const r of list) {
      const cat = r.category || 'Other';
      map.set(cat, (map.get(cat) || 0) + 1);
    }

    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  });

  readonly billReminders = computed(() => {
    const bills = ['Bill', 'Payment', 'Electricity', 'Internet', 'Water', 'Rent', 'Insurance', 'Subscription'];
    return this.reminderService.allReminders().filter(
      r => r.status === 'pending' && bills.includes(r.category)
    ).slice(0, 4);
  });

  readonly upcomingFestivals = computed<UpcomingFestivalItem[]>(() => {
    return this.festivalService.getUpcomingFestivals(4);
  });

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

    // Check festival (year-aware)
    const fest = this.festivalService.getFestival(bs.year, bs.month, bs.day);
    this.todayFestival.set(fest || null);
  }

  async handleQuickAdd(): Promise<void> {
    const raw = this.quickAddInput.trim();
    if (!raw) return;

    try {
      const parsed = this.nlpParser.parse(raw);
      await this.reminderService.addReminder({
        title: parsed.title,
        dateAD: parsed.dateAD,
        dateBS: parsed.dateBS,
        time: parsed.time,
        priority: parsed.priority,
        category: parsed.category,
        repeatType: parsed.repeatType,
        tags: parsed.tags,
        amount: parsed.amount,
        currency: parsed.currency,
        notificationSchedule: {
          remindAtTime: true,
          minutesBefore: [15]
        }
      });
      this.soundService.playChime();
      this.quickAddInput = '';
    } catch (e: any) {
      this.toast.error('Quick add failed: ' + (e?.message || 'Invalid input'));
    }
  }

  async dictateQuickAdd(): Promise<void> {
    try {
      const transcript = await this.voiceService.startListening();
      if (transcript && transcript.trim()) {
        this.quickAddInput = transcript.trim();
        await this.handleQuickAdd();
      }
    } catch (e) {
      console.warn('Dictation failed or cancelled:', e);
    }
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
