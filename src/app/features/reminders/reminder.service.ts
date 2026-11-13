import { Injectable, inject, signal, computed } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import {
  Reminder,
  ReminderStatus,
  Priority,
  RepeatType,
  ReminderCategory,
  SnoozeDuration,
  CalendarInputMode
} from '../../core/models/reminder.model';
import { ReminderRepository } from '../../database/repositories/reminder.repository';
import { IndexedDbService } from '../../core/services/indexed-db.service';
import { ToastService } from '../../core/services/toast.service';
import { NepaliCalendarService } from '../../core/services/nepali-calendar.service';
import { ReminderSchedulerService } from '../../core/services/reminder-scheduler.service';
import { SyncService } from '../../core/services/sync.service';
import { AttachmentService } from '../../core/services/attachment.service';

export interface CreateReminderDTO {
  title: string;
  description?: string;
  calendarMode?: CalendarInputMode;
  dateAD: string;
  dateBS: string;
  time: string;
  priority: Priority;
  category: ReminderCategory | string;
  repeatType: RepeatType;
  attachmentIds?: string[];
  files?: File[];
  notificationSchedule?: {
    remindAtTime: boolean;
    minutesBefore: number[];
  };
}

export type TemporalFilter = 'all' | 'today' | 'tomorrow' | 'thisWeek' | 'nextWeek' | 'thisMonth';
export type SortOption = 'date_asc' | 'date_desc' | 'priority' | 'title_asc' | 'created_desc';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private readonly reminderRepo = inject(ReminderRepository);
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly toast = inject(ToastService);
  private readonly nepaliCalendar = inject(NepaliCalendarService);
  private readonly scheduler = inject(ReminderSchedulerService);
  private readonly syncService = inject(SyncService);
  private readonly attachmentService = inject(AttachmentService);

  readonly allReminders = signal<Reminder[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Filter & Search Signals
  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<string>('all');
  readonly selectedPriority = signal<string>('all');
  readonly selectedStatus = signal<string>('all');
  readonly selectedTemporal = signal<TemporalFilter>('all');
  readonly selectedSort = signal<SortOption>('date_asc');

  // Today ISO Date
  private get todayIso(): string {
    return this.nepaliCalendar.formatAdIso(new Date());
  }

  // Filtered & Sorted Reminders list
  readonly filteredReminders = computed(() => {
    let list = this.allReminders();
    const query = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();
    const prio = this.selectedPriority();
    const stat = this.selectedStatus();
    const temp = this.selectedTemporal();
    const sort = this.selectedSort();
    const today = this.todayIso;

    // 1. Text Search (title, description, category, dateBS, dateAD)
    if (query) {
      list = list.filter(r =>
        r.title.toLowerCase().includes(query) ||
        (r.description && r.description.toLowerCase().includes(query)) ||
        r.category.toLowerCase().includes(query) ||
        r.dateBS.includes(query) ||
        r.dateAD.includes(query)
      );
    }

    // 2. Category Filter
    if (cat !== 'all') {
      list = list.filter(r => r.category === cat);
    }

    // 3. Priority Filter
    if (prio !== 'all') {
      list = list.filter(r => r.priority === prio);
    }

    // 4. Status Filter
    if (stat !== 'all') {
      list = list.filter(r => r.status === stat);
    }

    // 5. Temporal Bucket Filter
    if (temp !== 'all') {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const tomorrowIso = this.nepaliCalendar.formatAdIso(tomorrow);

      const dayOfWeek = now.getDay();
      const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (6 - dayOfWeek));
      const endOfWeekIso = this.nepaliCalendar.formatAdIso(endOfWeek);

      const nextWeekStart = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate() + 1);
      const nextWeekStartIso = this.nepaliCalendar.formatAdIso(nextWeekStart);
      const nextWeekEnd = new Date(nextWeekStart.getFullYear(), nextWeekStart.getMonth(), nextWeekStart.getDate() + 6);
      const nextWeekEndIso = this.nepaliCalendar.formatAdIso(nextWeekEnd);

      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const endOfMonthIso = this.nepaliCalendar.formatAdIso(endOfMonth);

      switch (temp) {
        case 'today':
          list = list.filter(r => r.dateAD === today);
          break;
        case 'tomorrow':
          list = list.filter(r => r.dateAD === tomorrowIso);
          break;
        case 'thisWeek':
          list = list.filter(r => r.dateAD >= today && r.dateAD <= endOfWeekIso);
          break;
        case 'nextWeek':
          list = list.filter(r => r.dateAD >= nextWeekStartIso && r.dateAD <= nextWeekEndIso);
          break;
        case 'thisMonth':
          list = list.filter(r => r.dateAD >= today && r.dateAD <= endOfMonthIso);
          break;
      }
    }

    // 6. Sort
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'date_asc':
          return a.dateAD.localeCompare(b.dateAD) || a.time.localeCompare(b.time);
        case 'date_desc':
          return b.dateAD.localeCompare(a.dateAD) || b.time.localeCompare(a.time);
        case 'priority': {
          const rank: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
          return rank[b.priority] - rank[a.priority];
        }
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'created_desc':
          return b.createdAt.localeCompare(a.createdAt);
        default:
          return 0;
      }
    });
  });

  // Computed temporal buckets
  readonly dueToday = computed(() => {
    const today = this.todayIso;
    return this.allReminders().filter(
      r => r.dateAD === today && (r.status === 'pending' || r.status === 'snoozed')
    );
  });

  readonly overdue = computed(() => {
    const today = this.todayIso;
    return this.allReminders().filter(
      r => r.dateAD < today && (r.status === 'pending' || r.status === 'snoozed')
    );
  });

  readonly upcoming = computed(() => {
    const today = this.todayIso;
    return this.allReminders().filter(
      r => r.dateAD > today && r.status === 'pending'
    );
  });

  readonly completed = computed(() => {
    return this.allReminders().filter(r => r.status === 'completed');
  });

  constructor() {
    this.initLiveQuery();
  }

  private initLiveQuery() {
    this.isLoading.set(true);
    this.indexedDbService.observe(() => this.reminderRepo.getAll()).subscribe({
      next: (items) => {
        const sorted = items.sort((a, b) => {
          const dateDiff = a.dateAD.localeCompare(b.dateAD);
          if (dateDiff !== 0) return dateDiff;
          return a.time.localeCompare(b.time);
        });
        this.allReminders.set(sorted);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error observing reminders:', err);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Create a new reminder
   */
  async addReminder(dto: CreateReminderDTO): Promise<Reminder> {
    const newReminder: Reminder = {
      id: uuidv4(),
      title: dto.title.trim(),
      description: dto.description?.trim(),
      calendarMode: dto.calendarMode || 'AD',
      dateAD: dto.dateAD,
      dateBS: dto.dateBS,
      time: dto.time,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      priority: dto.priority,
      category: dto.category,
      repeatType: dto.repeatType,
      notificationSchedule: dto.notificationSchedule || {
        remindAtTime: true,
        minutesBefore: [15]
      },
      attachmentIds: dto.attachmentIds || [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.reminderRepo.create(newReminder);

    if (dto.files && dto.files.length > 0) {
      const attachmentIds: string[] = [];
      for (const file of dto.files) {
        const att = await this.attachmentService.addAttachment(newReminder.id, 'reminder', file);
        attachmentIds.push(att.id);
      }
      newReminder.attachmentIds = attachmentIds;
      await this.reminderRepo.update(newReminder.id, { attachmentIds });
    }

    await this.scheduler.scheduleJobsForReminder(newReminder);
    await this.syncService.recordLocalChange('reminder', newReminder.id, 'create', newReminder);
    this.toast.success(`Reminder "${newReminder.title}" saved!`);
    return newReminder;
  }

  /**
   * Update existing reminder
   */
  async updateReminder(id: string, changes: Partial<Reminder> & { files?: File[] }): Promise<void> {
    const { files, ...reminderChanges } = changes;
    if (files && files.length > 0) {
      const existing = await this.reminderRepo.getById(id);
      const attachmentIds: string[] = [...(existing?.attachmentIds || [])];
      for (const file of files) {
        const att = await this.attachmentService.addAttachment(id, 'reminder', file);
        attachmentIds.push(att.id);
      }
      reminderChanges.attachmentIds = attachmentIds;
    }

    await this.reminderRepo.update(id, {
      ...reminderChanges,
      updatedAt: new Date().toISOString()
    });
    const updated = await this.reminderRepo.getById(id);
    if (updated) {
      await this.scheduler.scheduleJobsForReminder(updated);
      await this.syncService.recordLocalChange('reminder', id, 'update', updated);
    }
    this.toast.success('Reminder updated');
  }

  /**
   * Toggle complete/reopen with automated recurrence generation
   */
  async toggleComplete(reminder: Reminder): Promise<void> {
    if (reminder.status === 'completed') {
      // Reopen
      await this.reopenReminder(reminder.id);
    } else {
      // Mark as completed
      await this.reminderRepo.update(reminder.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      await this.scheduler.cancelJobsForReminder(reminder.id);
      await this.syncService.recordLocalChange('reminder', reminder.id, 'update');
      this.toast.info(`Completed "${reminder.title}"`);

      // Check for recurring repeat rule
      if (reminder.repeatType !== 'none') {
        await this.advanceRecurrence(reminder);
      }
    }
  }

  /**
   * Reopen completed reminder
   */
  async reopenReminder(id: string): Promise<void> {
    await this.reminderRepo.update(id, {
      status: 'pending',
      completedAt: undefined,
      updatedAt: new Date().toISOString()
    });
    const reopened = await this.reminderRepo.getById(id);
    if (reopened) {
      await this.scheduler.scheduleJobsForReminder(reopened);
      await this.syncService.recordLocalChange('reminder', id, 'update', reopened);
    }
    this.toast.info('Reminder reopened');
  }

  /**
   * Duplicate reminder
   */
  async duplicateReminder(reminder: Reminder): Promise<Reminder> {
    const duplicated: Reminder = {
      ...reminder,
      id: uuidv4(),
      title: `${reminder.title} (Copy)`,
      status: 'pending',
      completedAt: undefined,
      snoozedUntil: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await this.reminderRepo.create(duplicated);
    await this.scheduler.scheduleJobsForReminder(duplicated);
    await this.syncService.recordLocalChange('reminder', duplicated.id, 'create', duplicated);
    this.toast.success(`Duplicated "${reminder.title}"`);
    return duplicated;
  }

  /**
   * Delete reminder
   */
  async deleteReminder(id: string): Promise<void> {
    await this.reminderRepo.delete(id);
    await this.scheduler.cancelJobsForReminder(id);
    await this.syncService.recordLocalChange('reminder', id, 'delete');
    this.toast.info('Reminder deleted');
  }

  /**
   * Snooze reminder
   */
  async snoozeReminder(reminder: Reminder, duration: SnoozeDuration, customIsoTime?: string): Promise<void> {
    const now = new Date();
    let snoozedUntilDate: Date;

    switch (duration) {
      case '5m':
        snoozedUntilDate = new Date(now.getTime() + 5 * 60 * 1000);
        break;
      case '10m':
        snoozedUntilDate = new Date(now.getTime() + 10 * 60 * 1000);
        break;
      case '15m':
        snoozedUntilDate = new Date(now.getTime() + 15 * 60 * 1000);
        break;
      case '30m':
        snoozedUntilDate = new Date(now.getTime() + 30 * 60 * 1000);
        break;
      case '1h':
        snoozedUntilDate = new Date(now.getTime() + 60 * 60 * 1000);
        break;
      case '3h':
        snoozedUntilDate = new Date(now.getTime() + 180 * 60 * 1000);
        break;
      case 'tomorrow':
        snoozedUntilDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
        break;
      case 'custom':
        snoozedUntilDate = customIsoTime ? new Date(customIsoTime) : new Date(now.getTime() + 60 * 60 * 1000);
        break;
      default:
        snoozedUntilDate = new Date(now.getTime() + 15 * 60 * 1000);
    }

    const newAdDate = this.nepaliCalendar.formatAdIso(snoozedUntilDate);
    const newBsDateObj = this.nepaliCalendar.adToBs(newAdDate);
    const newBsDate = this.nepaliCalendar.formatBsIso(newBsDateObj);
    const newTime = `${String(snoozedUntilDate.getHours()).padStart(2, '0')}:${String(snoozedUntilDate.getMinutes()).padStart(2, '0')}`;

    await this.reminderRepo.update(reminder.id, {
      status: 'snoozed',
      dateAD: newAdDate,
      dateBS: newBsDate,
      time: newTime,
      snoozedUntil: snoozedUntilDate.toISOString(),
      updatedAt: new Date().toISOString()
    });

    const snoozedRem = await this.reminderRepo.getById(reminder.id);
    if (snoozedRem) {
      await this.scheduler.scheduleJobsForReminder(snoozedRem);
      await this.syncService.recordLocalChange('reminder', reminder.id, 'update', snoozedRem);
    }

    this.toast.info(`Snoozed until ${newTime}`);
  }

  /**
   * Advance recurring reminder to next occurrence
   */
  private async advanceRecurrence(prev: Reminder): Promise<void> {
    let nextAdStr = prev.dateAD;
    let nextBsStr = prev.dateBS;

    if (prev.repeatType === 'daily') {
      const parts = prev.dateAD.split('-').map(Number);
      const nextAd = new Date(parts[0], parts[1] - 1, parts[2] + 1);
      nextAdStr = this.nepaliCalendar.formatAdIso(nextAd);
      nextBsStr = this.nepaliCalendar.formatBsIso(this.nepaliCalendar.adToBs(nextAdStr));
    } else if (prev.repeatType === 'weekly') {
      const parts = prev.dateAD.split('-').map(Number);
      const nextAd = new Date(parts[0], parts[1] - 1, parts[2] + 7);
      nextAdStr = this.nepaliCalendar.formatAdIso(nextAd);
      nextBsStr = this.nepaliCalendar.formatBsIso(this.nepaliCalendar.adToBs(nextAdStr));
    } else if (prev.repeatType === 'monthly') {
      const parts = prev.dateAD.split('-').map(Number);
      const nextAd = new Date(parts[0], parts[1], parts[2]); // +1 month
      nextAdStr = this.nepaliCalendar.formatAdIso(nextAd);
      nextBsStr = this.nepaliCalendar.formatBsIso(this.nepaliCalendar.adToBs(nextAdStr));
    } else if (prev.repeatType === 'yearly_bs') {
      // BIKRAM SAMBAT YEARLY RECURRENCE:
      // Keep exact same BS month and day in the next BS year!
      const bsParts = prev.dateBS.split('-').map(Number);
      const nextYear = bsParts[0] + 1;
      const month = bsParts[1];
      let day = bsParts[2];

      // Check max days in that BS month
      const maxDays = this.nepaliCalendar.getDaysInBsMonth(nextYear, month);
      if (day > maxDays) day = maxDays;

      nextBsStr = this.nepaliCalendar.formatBsIso({ year: nextYear, month, day });
      // Convert to exact Gregorian AD Date!
      const nextAd = this.nepaliCalendar.bsToAd({ year: nextYear, month, day });
      nextAdStr = this.nepaliCalendar.formatAdIso(nextAd);
    } else if (prev.repeatType === 'yearly_ad') {
      const parts = prev.dateAD.split('-').map(Number);
      const nextAd = new Date(parts[0] + 1, parts[1] - 1, parts[2]);
      nextAdStr = this.nepaliCalendar.formatAdIso(nextAd);
      nextBsStr = this.nepaliCalendar.formatBsIso(this.nepaliCalendar.adToBs(nextAdStr));
    }

    const nextOccurrence: Reminder = {
      ...prev,
      id: uuidv4(),
      dateAD: nextAdStr,
      dateBS: nextBsStr,
      status: 'pending',
      completedAt: undefined,
      snoozedUntil: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.reminderRepo.create(nextOccurrence);
    await this.scheduler.scheduleJobsForReminder(nextOccurrence);
    await this.syncService.recordLocalChange('reminder', nextOccurrence.id, 'create', nextOccurrence);
    this.toast.info(`Next recurrence scheduled for ${nextBsStr} (${nextAdStr})`);
  }
}
