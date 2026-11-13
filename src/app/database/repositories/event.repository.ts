import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { EventRecord } from '../../core/models/event.model';
import { db } from '../db';

@Injectable({
  providedIn: 'root'
})
export class EventRepository extends BaseRepository<EventRecord, string> {
  constructor() {
    super(db.events);
  }

  async getEventsBetween(startAD: string, endAD: string): Promise<EventRecord[]> {
    return this.table
      .where('startDateAD')
      .between(startAD, endAD, true, true)
      .toArray();
  }
}
