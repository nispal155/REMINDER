import { Injectable, inject, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { EventRecord } from '../../core/models/event.model';
import { EventRepository } from '../../database/repositories/event.repository';
import { IndexedDbService } from '../../core/services/indexed-db.service';
import { ToastService } from '../../core/services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly eventRepo = inject(EventRepository);
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly toast = inject(ToastService);

  readonly events = signal<EventRecord[]>([]);

  constructor() {
    this.indexedDbService.observe(() => this.eventRepo.getAll()).subscribe({
      next: (items) => this.events.set(items),
      error: (err) => console.error('Error observing events:', err)
    });
  }

  async addEvent(eventData: Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EventRecord> {
    const newEvent: EventRecord = {
      ...eventData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await this.eventRepo.create(newEvent);
    this.toast.success(`Event "${newEvent.title}" added`);
    return newEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await this.eventRepo.delete(id);
    this.toast.info('Event removed');
  }
}
