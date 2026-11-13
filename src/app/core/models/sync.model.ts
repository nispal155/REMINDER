export interface AttachmentRecord {
  id: string;
  entityId: string;
  entityType: 'reminder' | 'event';
  fileName: string;
  fileType: string;
  fileSize: number;
  driveFileId?: string;
  localBlob?: Blob;
  isSynced: boolean;
  createdAt: string;
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

export interface SyncQueueRecord {
  id: string;
  entityType: 'reminder' | 'event' | 'birthday' | 'settings' | 'attachment';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  payload?: unknown;
  status: 'pending' | 'syncing' | 'failed';
  attempts: number;
  lastAttemptAt?: string;
  createdAt: string;
}

export interface MetadataRecord {
  key: string;
  value: unknown;
  updatedAt: string;
}
