import { Injectable, inject, signal, computed } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../database/db';
import { AuthService } from './auth.service';
import { GoogleDriveService } from './google-drive.service';
import { SyncQueueRepository } from '../../database/repositories/sync-queue.repository';
import {
  SyncStatus,
  SyncAction,
  SyncEntity,
  SyncConflict,
  MetadataRecord
} from '../models/sync.model';
import { Reminder } from '../models/reminder.model';
import { EventRecord } from '../models/event.model';
import { Birthday } from '../models/birthday.model';
import { SettingRecord } from '../models/settings.model';

const STORAGE_KEY_DEVICE_ID = 'reminder_device_id';
const STORAGE_KEY_LAST_SYNCED = 'reminder_last_synced_at';
const STORAGE_KEY_SYNC_VERSION = 'reminder_sync_version';

interface RemoteMetadataPayload {
  syncVersion: number;
  lastModifiedAt: string;
  deviceId: string;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private readonly authService = inject(AuthService);
  private readonly driveService = inject(GoogleDriveService);
  private readonly syncQueueRepo = inject(SyncQueueRepository);

  // Reactive State Signals
  readonly syncStatus = signal<SyncStatus>('synced');
  readonly lastSyncedAt = signal<string | null>(localStorage.getItem(STORAGE_KEY_LAST_SYNCED));
  readonly lastModifiedAt = signal<string | null>(null);
  readonly syncVersion = signal<number>(Number(localStorage.getItem(STORAGE_KEY_SYNC_VERSION) || '1'));
  readonly pendingCount = signal<number>(0);
  readonly activeConflict = signal<SyncConflict | null>(null);
  readonly isOnline = signal<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  readonly deviceId: string;
  private syncTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.initNetworkListeners();
    this.refreshPendingCount();
  }

  private getOrCreateDeviceId(): string {
    let id = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (!id) {
      id = 'dev_' + uuidv4().substring(0, 8);
      localStorage.setItem(STORAGE_KEY_DEVICE_ID, id);
    }
    return id;
  }

  private initNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline.set(true);
        if (this.syncStatus() === 'offline') {
          this.syncStatus.set('needs_sync');
        }
        // Attempt sync if pending items exist
        if (this.authService.isAuthenticated()) {
          this.scheduleDebouncedSync(1000);
        }
      });

      window.addEventListener('offline', () => {
        this.isOnline.set(false);
        this.syncStatus.set('offline');
      });
    }
  }

  async refreshPendingCount(): Promise<number> {
    const count = await this.syncQueueRepo.countPending();
    this.pendingCount.set(count);
    if (count > 0 && this.syncStatus() === 'synced') {
      this.syncStatus.set('needs_sync');
    }
    return count;
  }

  /**
   * Enqueue a local mutation for cloud sync.
   * Reminders and local edits always save instantly without waiting for Drive!
   */
  async recordLocalChange(
    entityType: SyncEntity,
    entityId: string,
    action: SyncAction,
    payload?: unknown
  ): Promise<void> {
    const now = new Date().toISOString();
    this.lastModifiedAt.set(now);

    await this.syncQueueRepo.enqueue(entityType, entityId, action, payload);
    await this.refreshPendingCount();

    if (!this.isOnline()) {
      this.syncStatus.set('offline');
      return;
    }

    if (this.authService.isAuthenticated()) {
      this.syncStatus.set('needs_sync');
      this.scheduleDebouncedSync(3000); // Debounce to batch rapid edits
    }
  }

  private scheduleDebouncedSync(delayMs: number): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.syncTimeout = setTimeout(() => {
      this.syncNow().catch(err => {
        console.warn('Background sync failed:', err);
      });
    }, delayMs);
  }

  /**
   * Performs full bidirectional sync with Google Drive.
   */
  async syncNow(): Promise<boolean> {
    if (!this.isOnline()) {
      this.syncStatus.set('offline');
      return false;
    }

    if (!this.authService.isAuthenticated()) {
      return false;
    }

    this.syncStatus.set('syncing');

    try {
      const folders = await this.driveService.initFolderStructure();
      const dataFolderId = folders.dataFolderId;
      if (!dataFolderId) {
        throw new Error('Google Drive data folder could not be resolved');
      }

      // Step 1: Pull remote data & resolve conflicts
      await this.pullRemoteChanges(dataFolderId);

      // Step 2: Push local state to Google Drive
      await this.pushLocalChanges(dataFolderId);

      // Finalize status
      const now = new Date().toISOString();
      const newVersion = this.syncVersion() + 1;
      this.syncVersion.set(newVersion);
      this.lastSyncedAt.set(now);
      localStorage.setItem(STORAGE_KEY_LAST_SYNCED, now);
      localStorage.setItem(STORAGE_KEY_SYNC_VERSION, String(newVersion));

      await this.syncQueueRepo.clearAll();
      this.pendingCount.set(0);
      this.syncStatus.set('synced');
      return true;
    } catch (err: unknown) {
      console.error('Sync error:', err);
      this.syncStatus.set('sync_failed');
      return false;
    }
  }

  /**
   * Pulls remote data files from Google Drive and merges into IndexedDB.
   */
  private async pullRemoteChanges(dataFolderId: string): Promise<void> {
    // Check remote metadata file
    const remoteMetaFile = await this.driveService.findFile('metadata.json', 'application/json', dataFolderId);
    if (!remoteMetaFile) {
      // First time sync, no remote data to pull
      return;
    }

    const remoteMeta = await this.driveService.downloadJsonFile<RemoteMetadataPayload>(remoteMetaFile.id);
    const localLastSync = this.lastSyncedAt();

    // If remote was updated after local last sync by another device, pull data
    if (localLastSync && remoteMeta.lastModifiedAt <= localLastSync && remoteMeta.deviceId === this.deviceId) {
      return; // Already up to date
    }

    // 1. Reminders
    const remindersFile = await this.driveService.findFile('reminders.json', 'application/json', dataFolderId);
    if (remindersFile) {
      const remoteReminders = await this.driveService.downloadJsonFile<Reminder[]>(remindersFile.id);
      await this.mergeReminders(remoteReminders);
    }

    // 2. Events
    const eventsFile = await this.driveService.findFile('events.json', 'application/json', dataFolderId);
    if (eventsFile) {
      const remoteEvents = await this.driveService.downloadJsonFile<EventRecord[]>(eventsFile.id);
      await this.mergeEvents(remoteEvents);
    }

    // 3. Birthdays
    const birthdaysFile = await this.driveService.findFile('birthdays.json', 'application/json', dataFolderId);
    if (birthdaysFile) {
      const remoteBirthdays = await this.driveService.downloadJsonFile<Birthday[]>(birthdaysFile.id);
      await this.mergeBirthdays(remoteBirthdays);
    }

    // 4. Settings
    const settingsFile = await this.driveService.findFile('settings.json', 'application/json', dataFolderId);
    if (settingsFile) {
      const remoteSettings = await this.driveService.downloadJsonFile<SettingRecord[]>(settingsFile.id);
      await this.mergeSettings(remoteSettings);
    }
  }

  /**
   * Pushes complete current state to Google Drive.
   */
  private async pushLocalChanges(dataFolderId: string): Promise<void> {
    const allReminders = await db.reminders.toArray();
    const allEvents = await db.events.toArray();
    const allBirthdays = await db.birthdays.toArray();
    const allSettings = await db.settings.toArray();

    // Upload JSON data files
    await this.driveService.uploadJsonFile('reminders.json', allReminders, dataFolderId);
    await this.driveService.uploadJsonFile('events.json', allEvents, dataFolderId);
    await this.driveService.uploadJsonFile('birthdays.json', allBirthdays, dataFolderId);
    await this.driveService.uploadJsonFile('settings.json', allSettings, dataFolderId);

    // Upload metadata
    const metaPayload: RemoteMetadataPayload = {
      syncVersion: this.syncVersion() + 1,
      lastModifiedAt: new Date().toISOString(),
      deviceId: this.deviceId
    };
    await this.driveService.uploadJsonFile('metadata.json', metaPayload, dataFolderId);
  }

  /**
   * Merge remote reminders with conflict detection.
   */
  private async mergeReminders(remoteList: Reminder[]): Promise<void> {
    for (const remote of remoteList) {
      const local = await db.reminders.get(remote.id);
      if (!local) {
        // New item from cloud
        await db.reminders.put(remote);
      } else {
        const localTime = new Date(local.updatedAt || local.createdAt).getTime();
        const remoteTime = new Date(remote.updatedAt || remote.createdAt).getTime();

        if (remoteTime > localTime) {
          // Cloud is strictly newer
          await db.reminders.put(remote);
        } else if (localTime > remoteTime) {
          // Local is strictly newer, keep local
          continue;
        } else {
          // Timestamps match or concurrent conflict
          if (JSON.stringify(local) !== JSON.stringify(remote)) {
            this.activeConflict.set({
              entityType: 'reminder',
              entityId: local.id,
              localData: local,
              cloudData: remote,
              localUpdatedAt: local.updatedAt,
              cloudUpdatedAt: remote.updatedAt
            });
          }
        }
      }
    }
  }

  private async mergeEvents(remoteList: EventRecord[]): Promise<void> {
    for (const remote of remoteList) {
      const local = await db.events.get(remote.id);
      if (!local) {
        await db.events.put(remote);
      } else {
        const localTime = new Date(local.updatedAt || local.createdAt).getTime();
        const remoteTime = new Date(remote.updatedAt || remote.createdAt).getTime();
        if (remoteTime > localTime) {
          await db.events.put(remote);
        }
      }
    }
  }

  private async mergeBirthdays(remoteList: Birthday[]): Promise<void> {
    for (const remote of remoteList) {
      const local = await db.birthdays.get(remote.id);
      if (!local) {
        await db.birthdays.put(remote);
      } else {
        const localTime = new Date(local.updatedAt || local.createdAt).getTime();
        const remoteTime = new Date(remote.updatedAt || remote.createdAt).getTime();
        if (remoteTime > localTime) {
          await db.birthdays.put(remote);
        }
      }
    }
  }

  private async mergeSettings(remoteList: SettingRecord[]): Promise<void> {
    for (const remote of remoteList) {
      await db.settings.put(remote);
    }
  }

  /**
   * User resolves a conflict manually.
   */
  async resolveConflict(conflict: SyncConflict, resolution: 'local' | 'cloud'): Promise<void> {
    if (resolution === 'cloud') {
      if (conflict.entityType === 'reminder') {
        await db.reminders.put(conflict.cloudData as Reminder);
      }
    } else {
      // Local wins -> enqueue update for next sync
      await this.recordLocalChange(conflict.entityType, conflict.entityId, 'update', conflict.localData);
    }
    this.activeConflict.set(null);
  }
}

