import { Injectable, inject } from '@angular/core';
import { db } from '../../database/db';
import { GoogleDriveService, DriveFileItem } from './google-drive.service';
import { AuthService } from './auth.service';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { ToastService } from './toast.service';
import { CryptoService, EncryptedPackage } from './crypto.service';
import { BackupSnapshot, AttachmentRecord } from '../models/sync.model';
import { Reminder } from '../models/reminder.model';
import { EventRecord } from '../models/event.model';
import { Birthday } from '../models/birthday.model';
import { SettingRecord } from '../models/settings.model';
import { environment } from '../../../environments/environment';

const STORAGE_KEY_LAST_BACKUP = 'reminder_last_backup_date';
const MAX_BACKUP_SIZE = 50 * 1024 * 1024; // 50 MB limit

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private readonly driveService = inject(GoogleDriveService);
  private readonly authService = inject(AuthService);
  private readonly scheduler = inject(ReminderSchedulerService);
  private readonly toast = inject(ToastService);
  private readonly cryptoService = inject(CryptoService);

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
   * Optionally encrypted with user passphrase (AES-256-GCM)
   */
  async backupToDrive(passphrase?: string): Promise<string> {
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

    let fileId: string;
    if (passphrase && passphrase.trim().length > 0) {
      // Encrypt sensitive snapshot
      const rawJson = JSON.stringify(snapshot);
      const encryptedPkg = await this.cryptoService.encrypt(rawJson, passphrase, environment.appVersion);
      const fileName = `REMINDER_BACKUP_${dateStr}.enc`;
      fileId = await this.driveService.uploadJsonFile(fileName, encryptedPkg, backupsFolderId);
      this.toast.success(`Encrypted cloud backup saved (${snapshot.data.reminders.length} reminders)`);
    } else {
      const fileName = `REMINDER_BACKUP_${dateStr}.json`;
      fileId = await this.driveService.uploadJsonFile(fileName, snapshot, backupsFolderId);
      this.toast.success(`Cloud backup saved (${snapshot.data.reminders.length} reminders)`);
    }

    localStorage.setItem(STORAGE_KEY_LAST_BACKUP, new Date().toISOString());
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
   * Restore state from a Google Drive backup file (supports both .json and .enc)
   */
  async restoreFromDrive(fileId: string, passphrase?: string): Promise<void> {
    const rawData = await this.driveService.downloadJsonFile<any>(fileId);

    let snapshot: BackupSnapshot;
    if (rawData?.format === 'REMINDER_ENC_V1') {
      if (!passphrase) {
        throw new Error('This is an encrypted backup. Passphrase is required to restore.');
      }
      const decryptedJson = await this.cryptoService.decrypt(rawData as EncryptedPackage, passphrase);
      snapshot = JSON.parse(decryptedJson);
    } else {
      snapshot = rawData as BackupSnapshot;
    }

    await this.applySnapshot(snapshot);
    this.toast.success('Backup successfully restored from Google Drive!');
  }

  /**
   * Local Export: downloads JSON file or encrypted .enc package directly to device
   */
  async exportLocalJson(passphrase?: string): Promise<void> {
    const snapshot = await this.createSnapshot();
    const dateStr = new Date().toISOString().slice(0, 10);

    let blob: Blob;
    let fileName: string;

    if (passphrase && passphrase.trim().length > 0) {
      const rawJson = JSON.stringify(snapshot);
      const encryptedPkg = await this.cryptoService.encrypt(rawJson, passphrase, environment.appVersion);
      blob = new Blob([JSON.stringify(encryptedPkg, null, 2)], { type: 'application/octet-stream' });
      fileName = `REMINDER_BACKUP_${dateStr}.enc`;
    } else {
      const jsonStr = JSON.stringify(snapshot, null, 2);
      blob = new Blob([jsonStr], { type: 'application/json' });
      fileName = `REMINDER_BACKUP_${dateStr}.json`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success(`Backup file exported successfully (${fileName})`);
  }

  /**
   * Local Import: validates and restores from a user-supplied JSON or .enc file
   */
  async importLocalJson(file: File, passphrase?: string): Promise<void> {
    if (file.size > MAX_BACKUP_SIZE) {
      throw new Error(`Backup file exceeds maximum allowed limit (50 MB). Size: ${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }

    const text = await file.text();
    let snapshot: BackupSnapshot;

    if (this.cryptoService.isEncryptedPackage(text)) {
      if (!passphrase) {
        throw new Error('This file is password-protected. Please enter your encryption passphrase.');
      }
      const pkg: EncryptedPackage = JSON.parse(text);
      const decryptedJson = await this.cryptoService.decrypt(pkg, passphrase);
      try {
        snapshot = JSON.parse(decryptedJson);
      } catch {
        throw new Error('Decrypted content is not valid JSON.');
      }
    } else {
      try {
        snapshot = JSON.parse(text);
      } catch {
        throw new Error('The selected file is not a valid JSON document.');
      }
    }

    if (!snapshot || typeof snapshot.version !== 'number' || !snapshot.data) {
      throw new Error('The file does not match the REMINDER backup schema.');
    }

    await this.applySnapshot(snapshot);
    this.toast.success('Backup file restored successfully!');
  }

  /**
   * Atomic restoration of all entities into IndexedDB
   */
  private async applySnapshot(snapshot: BackupSnapshot): Promise<void> {
    const { reminders, events, birthdays, settings, attachmentsMetadata } = snapshot.data;

    await db.transaction('rw', [db.reminders, db.events, db.birthdays, db.settings, db.attachments, db.notificationJobs], async () => {
      if (reminders && Array.isArray(reminders)) {
        await db.reminders.clear();
        await db.reminders.bulkAdd(reminders as Reminder[]);
      }
      if (events && Array.isArray(events)) {
        await db.events.clear();
        await db.events.bulkAdd(events as EventRecord[]);
      }
      if (birthdays && Array.isArray(birthdays)) {
        await db.birthdays.clear();
        await db.birthdays.bulkAdd(birthdays as Birthday[]);
      }
      if (settings && Array.isArray(settings)) {
        await db.settings.clear();
        await db.settings.bulkAdd(settings as SettingRecord[]);
      }
      if (attachmentsMetadata && Array.isArray(attachmentsMetadata)) {
        await db.attachments.clear();
        const records: AttachmentRecord[] = attachmentsMetadata.map(meta => ({
          ...meta,
          localBlob: undefined
        }));
        await db.attachments.bulkAdd(records);
      }

      await db.notificationJobs.clear();
    });

    // Re-schedule notification jobs from restored reminders
    try {
      if (reminders && Array.isArray(reminders)) {
        await this.scheduler.rebuildAllJobs(reminders as Reminder[]);
      }
    } catch (err) {
      console.warn('Post-restore rescheduling alert:', err);
    }
  }
}
