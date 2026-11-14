import { Injectable, inject, signal, computed } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { EventRecord } from '../../core/models/event.model';
import { EventRepository } from '../../database/repositories/event.repository';
import { IndexedDbService } from '../../core/services/indexed-db.service';
import { NepaliCalendarService } from '../../core/services/nepali-calendar.service';
import { SyncService } from '../../core/services/sync.service';
import { ToastService } from '../../core/services/toast.service';
import { RepeatType, NotificationSchedule } from '../../core/models/reminder.model';

export interface CreateEventDTO {
  title: string;
  description?: string;
  startDateAD: string;
  startDateBS: string;
  endDateAD?: string;
  endDateBS?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  repeatType?: RepeatType;
  notificationSchedule?: NotificationSchedule;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly eventRepo = inject(EventRepository);
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly nepaliCalendar = inject(NepaliCalendarService);
  private readonly syncService = inject(SyncService);
  private readonly toast = inject(ToastService);

  readonly allEvents = signal<EventRecord[]>([]);

  readonly upcomingEvents = computed(() => {
    const today = this.nepaliCalendar.formatAdIso(new Date());
    return this.allEvents()
      .filter(e => e.startDateAD >= today || (e.endDateAD && e.endDateAD >= today))
      .sort((a, b) => a.startDateAD.localeCompare(b.startDateAD));
  });

  constructor() {
    this.indexedDbService.observe(() => this.eventRepo.getAll()).subscribe({
      next: (items) => this.allEvents.set(items),
      error: (err) => console.error('Error observing events:', err)
    });
  }

  async addEvent(dto: CreateEventDTO): Promise<EventRecord> {
    const newEvent: EventRecord = {
      id: uuidv4(),
      title: dto.title.trim(),
      description: dto.description?.trim(),
      startDateAD: dto.startDateAD,
      startDateBS: dto.startDateBS,
      endDateAD: dto.endDateAD || dto.startDateAD,
      endDateBS: dto.endDateBS || dto.startDateBS,
      startTime: dto.startTime || '09:00',
      endTime: dto.endTime || '10:00',
      location: dto.location?.trim(),
      repeatType: dto.repeatType || 'none',
      notificationSchedule: dto.notificationSchedule || {
        remindAtTime: true,
        minutesBefore: [15, 60]
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.eventRepo.create(newEvent);
    await this.syncService.recordLocalChange('event', newEvent.id, 'create', newEvent);
    this.toast.success(`Event "${newEvent.title}" scheduled!`);
    return newEvent;
  }

  async updateEvent(id: string, changes: Partial<EventRecord>): Promise<void> {
    await this.eventRepo.update(id, {
      ...changes,
      updatedAt: new Date().toISOString()
    });
    const updated = await this.eventRepo.getById(id);
    if (updated) {
      await this.syncService.recordLocalChange('event', id, 'update', updated);
    }
    this.toast.success('Event updated');
  }

  async deleteEvent(id: string): Promise<void> {
    await this.eventRepo.delete(id);
    await this.syncService.recordLocalChange('event', id, 'delete');
    this.toast.info('Event deleted');
  }
}
