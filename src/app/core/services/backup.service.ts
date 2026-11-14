import { Injectable, inject } from '@angular/core';
import { db } from '../../database/db';
import { GoogleDriveService, DriveFileItem } from './google-drive.service';
import { AuthService } from './auth.service';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { ToastService } from './toast.service';
import { BackupSnapshot, AttachmentRecord } from '../models/sync.model';
import { Reminder } from '../models/reminder.model';
import { EventRecord } from '../models/event.model';
import { Birthday } from '../models/birthday.model';
import { SettingRecord } from '../models/settings.model';
import { environment } from '../../../environments/environment';

const STORAGE_KEY_LAST_BACKUP = 'reminder_last_backup_date';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private readonly driveService = inject(GoogleDriveService);
  private readonly authService = inject(AuthService);
  private readonly scheduler = inject(ReminderSchedulerService);
  private readonly toast = inject(ToastService);

  /**
   * Generates a complete serialized snapshot of local IndexedDB data
   */
  async createSnapshot(): Promise<BackupSnapshot> {
    const reminders = await db.reminders.toArray();
    const events = await db.events.toArray();
    const birthdays = await db.birthdays.toArray();
    const settings = await db.settings.toArray();
    const rawAttachments = await db.attachments.toArray();

    // Strip binary Blobs from JSON snapshot to keep backup portable
    const attachmentsMetadata: Omit<AttachmentRecord, 'localBlob'>[] = rawAttachments.map(a => {
      const { localBlob, ...rest } = a;
      return rest;
    });

    const deviceId = localStorage.getItem('reminder_device_id') || 'local';

    return {
      version: 1,
      appVersion: environment.appVersion,
      exportedAt: new Date().toISOString(),
      deviceId,
      data: {
        reminders,
        events,
        birthdays,
        settings,
        attachmentsMetadata
      }
    };
  }

  /**
   * Cloud Backup: creates timestamped snapshot in REMINDER_APP/backups/
   */
  async backupToDrive(): Promise<string> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Please sign in to Google to create cloud backups.');
    }

    const folders = await this.driveService.initFolderStructure();
    const backupsFolderId = folders.backupsFolderId;
    if (!backupsFolderId) {
      throw new Error('Google Drive backups folder could not be found.');
    }

    const snapshot = await this.createSnapshot();
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `REMINDER_BACKUP_${dateStr}.json`;

    const fileId = await this.driveService.uploadJsonFile(fileName, snapshot, backupsFolderId);
    localStorage.setItem(STORAGE_KEY_LAST_BACKUP, new Date().toISOString());
    this.toast.success(`Cloud backup saved (${snapshot.data.reminders.length} reminders)`);
    return fileId;
  }

  /**
   * List cloud backups available in Google Drive
   */
  async listDriveBackups(): Promise<DriveFileItem[]> {
    if (!this.authService.isAuthenticated()) {
      return [];
    }
    const folders = await this.driveService.initFolderStructure();
    if (!folders.backupsFolderId) return [];
    return await this.driveService.listFiles(folders.backupsFolderId);
  }

  /**
   * Restore state from a Google Drive backup file
   */
  async restoreFromDrive(fileId: string): Promise<void> {
    const snapshot = await this.driveService.downloadJsonFile<BackupSnapshot>(fileId);
    await this.applySnapshot(snapshot);
    this.toast.success('Backup successfully restored from Google Drive!');
  }

  /**
   * Local Export: downloads JSON file directly to device
   */
  async exportLocalJson(): Promise<void> {
    const snapshot = await this.createSnapshot();
    const jsonStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `REMINDER_BACKUP_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Backup file exported successfully');
  }

  /**
   * Local Import: validates and restores from a user-supplied JSON file
   */
  async importLocalJson(file: File): Promise<void> {
    const text = await file.text();
    let snapshot: BackupSnapshot;

    try {
      snapshot = JSON.parse(text);
    } catch {
      throw new Error('The selected file is not a valid JSON document.');
    }

    if (!snapshot.version || !snapshot.data) {
      throw new Error('The file does not match the REMINDER backup schema.');
    }

    await this.applySnapshot(snapshot);
    this.toast.success('Backup file restored successfully!');
  }

  /**
   * Atomically overwrites IndexedDB tables with snapshot data
   */
  async applySnapshot(snapshot: BackupSnapshot): Promise<void> {
    await db.transaction('rw', [db.reminders, db.events, db.birthdays, db.settings, db.attachments], async () => {
      // Clear existing records
      await db.reminders.clear();
      await db.events.clear();
      await db.birthdays.clear();
      await db.settings.clear();
      await db.attachments.clear();

      // Repopulate
      if (snapshot.data.reminders?.length) {
        await db.reminders.bulkAdd(snapshot.data.reminders as Reminder[]);
      }
      if (snapshot.data.events?.length) {
        await db.events.bulkAdd(snapshot.data.events as EventRecord[]);
      }
      if (snapshot.data.birthdays?.length) {
        await db.birthdays.bulkAdd(snapshot.data.birthdays as Birthday[]);
      }
      if (snapshot.data.settings?.length) {
        await db.settings.bulkAdd(snapshot.data.settings as SettingRecord[]);
      }
      if (snapshot.data.attachmentsMetadata?.length) {
        await db.attachments.bulkAdd(snapshot.data.attachmentsMetadata as AttachmentRecord[]);
      }
    });

    // Reschedule reminder notifications
    const allReminders = await db.reminders.toArray();
    await this.scheduler.rebuildAllJobs(allReminders);
  }
}

