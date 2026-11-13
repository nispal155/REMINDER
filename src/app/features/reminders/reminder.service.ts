import { Injectable, inject, signal, computed } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Reminder, ReminderStatus, Priority, RepeatType } from '../../core/models/reminder.model';
import { ReminderRepository } from '../../database/repositories/reminder.repository';
import { IndexedDbService } from '../../core/services/indexed-db.service';
import { ToastService } from '../../core/services/toast.service';

export interface CreateReminderDTO {
  title: string;
  description?: string;
  dateAD?: string;
  dateBS?: string;
  time?: string;
  priority?: Priority;
  category?: string;
  repeatType?: RepeatType;
}

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private readonly reminderRepo = inject(ReminderRepository);
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly toast = inject(ToastService);

  readonly allReminders = signal<Reminder[]>([]);
  readonly isLoading = signal<boolean>(false);

  // Computed signals
  readonly dueToday = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.allReminders().filter(
      r => r.dateAD === today && (r.status === 'pending' || r.status === 'snoozed')
    );
  });

  readonly overdue = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.allReminders().filter(
      r => r.dateAD < today && (r.status === 'pending' || r.status === 'snoozed')
    );
  });

  readonly upcoming = computed(() => {
    const today = new Date().toISOString().split('T')[0];
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
        // Sort by date and time
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

  async addReminder(dto: CreateReminderDTO): Promise<Reminder> {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newReminder: Reminder = {
      id: uuidv4(),
      title: dto.title.trim(),
      description: dto.description?.trim(),
      dateAD: dto.dateAD || todayStr,
      dateBS: dto.dateBS || '2081-07-28', // Placeholder for Phase 1
      time: dto.time || defaultTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      priority: dto.priority || 'medium',
      category: dto.category || 'General',
      repeatType: dto.repeatType || 'none',
      notificationSchedule: {
        remindAtTime: true,
        minutesBefore: [15]
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.reminderRepo.create(newReminder);
    this.toast.success(`Reminder "${newReminder.title}" saved!`);
    return newReminder;
  }

  async toggleComplete(reminder: Reminder): Promise<void> {
    const nextStatus: ReminderStatus = reminder.status === 'completed' ? 'pending' : 'completed';
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : undefined;

    await this.reminderRepo.update(reminder.id, {
      status: nextStatus,
      completedAt,
      updatedAt: new Date().toISOString()
    });

    if (nextStatus === 'completed') {
      this.toast.info(`Completed "${reminder.title}"`);
    }
  }

  async deleteReminder(id: string): Promise<void> {
    await this.reminderRepo.delete(id);
    this.toast.info('Reminder deleted');
  }

  async updateReminder(id: string, changes: Partial<Reminder>): Promise<void> {
    await this.reminderRepo.update(id, {
      ...changes,
      updatedAt: new Date().toISOString()
    });
    this.toast.success('Reminder updated');
  }
}
