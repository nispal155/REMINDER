# Database Guide — IndexedDB & Dexie.js

This document details the local database architecture, schema stores, indexes, and repositories in the REMINDER application.

---

## 1. Primary Store: IndexedDB via Dexie.js

IndexedDB is the **single source of truth** for all application data. Google Drive serves as a secondary background backup and synchronization medium.

- **Database Name**: `ReminderDatabase`
- **Engine**: Dexie.js v4
- **Schema Version**: 1

---

## 2. Table Definitions

```typescript
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
```

### Table Breakdown

| Store Name | Primary Key | Indexed Fields | Purpose |
|---|---|---|---|
| `reminders` | `id` (UUID) | `dateAD`, `dateBS`, `status`, `priority`, `category`, `repeatType`, `createdAt`, `updatedAt` | Core reminders, checklists, and tasks |
| `events` | `id` (UUID) | `startDateAD`, `startDateBS`, `endDateAD`, `createdAt`, `updatedAt` | Multi-day events and scheduled appointments |
| `birthdays` | `id` (UUID) | `dateAD`, `dateBS`, `name`, `createdAt`, `updatedAt` | Birthdays and anniversaries |
| `settings` | `key` (string) | `key` | User preferences, quiet hours, theme, and language |
| `attachments` | `id` (UUID) | `entityId`, `entityType`, `fileType`, `isSynced`, `createdAt` | Metadata and local binary blobs for files |
| `notificationJobs` | `id` (UUID) | `entityId`, `scheduledTime`, `status` | Computed future alert schedule entries |
| `syncQueue` | `id` (UUID) | `entityType`, `entityId`, `action`, `status`, `createdAt` | FIFO offline mutation queue for Google Drive sync |
| `metadata` | `key` (string) | `key` | Sync tokens, device ID, and folder IDs |

---

## 3. Repositories Pattern

All database access is encapsulated inside repositories inheriting from `BaseRepository<T, TKey>`:

```typescript
export abstract class BaseRepository<T, TKey> {
  constructor(protected table: Table<T, TKey>) {}
  async getById(id: TKey): Promise<T | undefined>;
  async getAll(): Promise<T[]>;
  async create(item: T): Promise<TKey>;
  async update(id: TKey, changes: Partial<T>): Promise<number>;
  async delete(id: TKey): Promise<void>;
  async clear(): Promise<void>;
}
```

### Specialized Repositories
- **`ReminderRepository`**: Provides queries like `getDueToday()`, `getOverdue()`, and `getByDateBS()`.
- **`NotificationJobRepository`**: Provides `getDueJobs(nowIso)` for background dispatch.
- **`SyncQueueRepository`**: Manages atomic enqueuing, marking `syncing`, failure counters, and dequeuing.
- **`AttachmentRepository`**: Handles blob storage and Google Drive File ID linking.

