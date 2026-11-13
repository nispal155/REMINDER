import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { Reminder, ReminderStatus } from '../../core/models/reminder.model';
import { db } from '../db';

@Injectable({
  providedIn: 'root'
})
export class ReminderRepository extends BaseRepository<Reminder, string> {
  constructor() {
    super(db.reminders);
  }

  async getByDateAD(dateAD: string): Promise<Reminder[]> {
    return this.table.where('dateAD').equals(dateAD).toArray();
  }

  async getByDateBS(dateBS: string): Promise<Reminder[]> {
    return this.table.where('dateBS').equals(dateBS).toArray();
  }

  async getByStatus(status: ReminderStatus): Promise<Reminder[]> {
    return this.table.where('status').equals(status).toArray();
  }

  async getDueToday(todayAD: string): Promise<Reminder[]> {
    return this.table
      .where('dateAD')
      .equals(todayAD)
      .and(r => r.status === 'pending' || r.status === 'snoozed')
      .toArray();
  }

  async getOverdue(todayAD: string): Promise<Reminder[]> {
    return this.table
      .where('dateAD')
      .below(todayAD)
      .and(r => r.status === 'pending' || r.status === 'snoozed')
      .toArray();
  }

  async getUpcoming(todayAD: string, limit = 10): Promise<Reminder[]> {
    return this.table
      .where('dateAD')
      .above(todayAD)
      .and(r => r.status === 'pending')
      .limit(limit)
      .toArray();
  }
}

