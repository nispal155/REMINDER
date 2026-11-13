export type AttachmentCategory = 'images' | 'documents' | 'bills';

export interface AttachmentRecord {
  id: string;
  entityId: string;
  entityType: 'reminder' | 'event';
  fileName: string;
  fileType: string;
  fileSize: number;
  category: AttachmentCategory;
  driveFileId?: string;
  localBlob?: Blob;
  isSynced: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationJobRecord {
  id: string;
  entityId: string;
  entityType: 'reminder' | 'event' | 'birthday';
  title: string;
  body: string;
  scheduledTime: string; // ISO string
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: string;
}

export type SyncAction = 'create' | 'update' | 'delete';
export type SyncEntity = 'reminder' | 'event' | 'birthday' | 'settings' | 'attachment';
export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'sync_failed' | 'needs_sync';

export interface SyncQueueRecord {
  id: string;
  entityType: SyncEntity;
  entityId: string;
  action: SyncAction;
  payload?: unknown;
  status: 'pending' | 'syncing' | 'failed';
  attempts: number;
  error?: string;
  lastAttemptAt?: string;
  createdAt: string;
}

export interface MetadataRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  grantedScopes?: string[];
}

export interface DriveFolderStructure {
  appRootId?: string;
  dataFolderId?: string;
  attachmentsFolderId?: string;
  imagesFolderId?: string;
  documentsFolderId?: string;
  billsFolderId?: string;
  backupsFolderId?: string;
}

export interface SyncConflict<T = unknown> {
  entityType: SyncEntity;
  entityId: string;
  localData: T;
  cloudData: T;
  localUpdatedAt: string;
  cloudUpdatedAt: string;
}

export interface BackupSnapshot {
  version: number;
  appVersion: string;
  exportedAt: string;
  deviceId: string;
  data: {
    reminders: unknown[];
    events: unknown[];
    birthdays: unknown[];
    settings: unknown[];
    attachmentsMetadata: Omit<AttachmentRecord, 'localBlob'>[];
  };
}
