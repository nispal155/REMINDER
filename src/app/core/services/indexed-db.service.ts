import { Injectable } from '@angular/core';
import { liveQuery, Observable } from 'dexie';
import { from, Observable as RxObservable } from 'rxjs';
import { db, ReminderDatabase } from '../../database/db';
import { Reminder } from '../models/reminder.model';
import { Birthday } from '../models/birthday.model';
import { EventRecord } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  readonly database: ReminderDatabase = db;

  /**
   * Helper to turn any Dexie liveQuery into an RxJS Observable
   */
  observe<T>(querier: () => Promise<T> | T): RxObservable<T> {
    return new RxObservable<T>((subscriber) => {
      const observable = liveQuery(querier);
      const subscription = observable.subscribe({
        next: (val) => subscriber.next(val),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete()
      });
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get approximate storage quota & usage
   */
  async getStorageEstimate(): Promise<{ usageMB: number; quotaMB: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1;
      return {
        usageMB: +(usage / (1024 * 1024)).toFixed(2),
        quotaMB: +(quota / (1024 * 1024)).toFixed(2),
        percentage: +((usage / quota) * 100).toFixed(1)
      };
    }
    return { usageMB: 0, quotaMB: 0, percentage: 0 };
  }

  /**
   * Retrieve total record counts across all primary tables
   */
  async getDatabaseStats(): Promise<{
    reminders: number;
    events: number;
    birthdays: number;
    settings: number;
    attachments: number;
    queue: number;
  }> {
    const [reminders, events, birthdays, settings, attachments, queue] = await Promise.all([
      db.reminders.count(),
      db.events.count(),
      db.birthdays.count(),
      db.settings.count(),
      db.attachments.count(),
      db.syncQueue.count()
    ]);
    return { reminders, events, birthdays, settings, attachments, queue };
  }

  /**
   * Seed demo data for testing Phase 1
   */
  async seedDemoData(): Promise<void> {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 86400000);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const sampleReminders: Reminder[] = [
      {
        id: 'sample-rem-1',
        title: 'Review weekly goals & task checklist',
        description: 'Check progress on monthly milestones and clear reminders inbox.',
        dateAD: todayStr,
        dateBS: '2081-07-28',
        time: '10:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        priority: 'high',
        category: 'Personal',
        repeatType: 'daily',
        notificationSchedule: { remindAtTime: true, minutesBefore: [15] },
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sample-rem-2',
        title: 'Drink 2L of water throughout the afternoon',
        description: 'Stay hydrated during work sessions.',
        dateAD: todayStr,
        dateBS: '2081-07-28',
        time: '14:30',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        priority: 'medium',
        category: 'Health',
        repeatType: 'daily',
        notificationSchedule: { remindAtTime: true, minutesBefore: [] },
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sample-rem-3',
        title: 'Prepare project documentation & PWA manifest',
        description: 'Ensure offline caching and Dexie tables are verified.',
        dateAD: tomorrowStr,
        dateBS: '2081-07-29',
        time: '09:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        priority: 'urgent',
        category: 'Work',
        repeatType: 'none',
        notificationSchedule: { remindAtTime: true, minutesBefore: [30] },
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const sampleBirthdays: Birthday[] = [
      {
        id: 'sample-bday-1',
        name: 'Aarav Sharma',
        type: 'birthday',
        dateAD: todayStr,
        dateBS: '2081-07-28',
        relationship: 'family',
        notes: 'Likes sci-fi books and tech gadgets',
        notificationSchedule: { onDay: true, daysBefore: [1], time: '09:00' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    await db.transaction('rw', db.reminders, db.birthdays, async () => {
      await db.reminders.bulkPut(sampleReminders);
      await db.birthdays.bulkPut(sampleBirthdays);
    });
  }

  /**
   * Reset / clear all tables
   */
  async clearAllData(): Promise<void> {
    await Promise.all([
      db.reminders.clear(),
      db.events.clear(),
      db.birthdays.clear(),
      db.settings.clear(),
      db.attachments.clear(),
      db.notificationJobs.clear(),
      db.syncQueue.clear(),
      db.metadata.clear()
    ]);
  }
}

