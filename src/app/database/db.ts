import Dexie, { Table } from 'dexie';
import { Reminder } from '../core/models/reminder.model';
import { EventRecord } from '../core/models/event.model';
import { Birthday } from '../core/models/birthday.model';
import { SettingRecord } from '../core/models/settings.model';
import {
  AttachmentRecord,
  NotificationJobRecord,
  SyncQueueRecord,
  MetadataRecord
} from '../core/models/sync.model';

export class ReminderDatabase extends Dexie {
  reminders!: Table<Reminder, string>;
  events!: Table<EventRecord, string>;
  birthdays!: Table<Birthday, string>;
  settings!: Table<SettingRecord, string>;
  attachments!: Table<AttachmentRecord, string>;
  notificationJobs!: Table<NotificationJobRecord, string>;
  syncQueue!: Table<SyncQueueRecord, string>;
  metadata!: Table<MetadataRecord, string>;

  constructor() {
    super('ReminderDatabase');

    // Schema definition for version 1
    this.version(1).stores({
      reminders: 'id, dateAD, dateBS, status, priority, category, repeatType, createdAt, updatedAt',
      events: 'id, startDateAD, startDateBS, endDateAD, createdAt, updatedAt',
      birthdays: 'id, dateAD, dateBS, name, createdAt, updatedAt',
      settings: 'key',
      attachments: 'id, entityId, entityType, fileType, isSynced, createdAt',
      notificationJobs: 'id, entityId, scheduledTime, status',
      syncQueue: 'id, entityType, entityId, action, status, createdAt',
      metadata: 'key'
    });
  }
}

export const db = new ReminderDatabase();

