# Google Drive Cloud Sync & Attachments Guide

This document describes the cloud storage architecture, OAuth 2.0 authentication flow, bidirectional synchronization, conflict resolution, and attachment binary pipeline.

---

## 1. Google Drive Directory Structure

When the user connects their Google account, `GoogleDriveService.initFolderStructure()` automatically discovers or creates the following structure under the user's Google Drive:

```
REMINDER_APP/
│
├── data/
│   ├── reminders.json
│   ├── events.json
│   ├── birthdays.json
│   ├── settings.json
│   └── metadata.json
│
├── attachments/
│   ├── images/
│   ├── documents/
│   └── bills/
│
└── backups/
    └── REMINDER_BACKUP_YYYY-MM-DD_HHmmss.json
```

---

## 2. Authentication Flow (Google Identity Services)

The app utilizes client-side token flow via the official Google Identity Services (`google.accounts.oauth2.initTokenClient`):

1. **Authorization Request**:
   - Scopes requested:
     - `https://www.googleapis.com/auth/drive.file` (access only to files created by REMINDER)
     - `https://www.googleapis.com/auth/userinfo.profile`
     - `https://www.googleapis.com/auth/userinfo.email`
2. **Owner Verification Guard**:
   - Email is verified against `authorizedEmail`.
   - If a family member signs in with an unauthorized account, the access token is immediately revoked and blocked.
3. **Session Persistence**:
   - Access token and expiration timestamp are saved in local storage.
   - Expired tokens are automatically detected and renewed without data corruption.

---

## 3. Bidirectional Synchronization (`SyncService`)

### Local-to-Cloud (Push)
1. Any mutation in IndexedDB records an entry in `syncQueue` (`create`, `update`, `delete`).
2. When online and authenticated, `SyncService` drains the queue:
   - Reads the full snapshot from IndexedDB.
   - Writes updated JSON files (`reminders.json`, `events.json`, `birthdays.json`, `settings.json`) via multipart upload to `REMINDER_APP/data/`.
   - Updates `metadata.json` with an incremented `syncVersion`, `deviceId`, and `lastModifiedAt`.
   - Clears processed `syncQueue` records.

### Cloud-to-Local (Pull & Merge)
1. Periodic or manual sync fetches `metadata.json` from `REMINDER_APP/data/`.
2. If remote `lastModifiedAt` is newer than local `lastSyncedAt`:
   - Downloads remote JSON files.
   - Compares timestamps (`updatedAt`).
   - If remote is newer: overwrites local record in IndexedDB.
   - If local is newer: preserves local record and schedules push.
   - If concurrent diverging edits exist: opens the **Sync Conflict Modal**.

---

## 4. Conflict Resolution Dialog

```
┌──────────────────────────────────────────────┐
│ ⚠️ Sync Conflict Detected                    │
│                                              │
│ 📱 Local Version        ☁️ Cloud Version     │
│ 10:45 AM                11:15 AM             │
│ "Pay Electricity Bill"  "Paid Online Rs 450" │
│                                              │
│ [ Keep Local ]          [ Keep Cloud ]       │
└──────────────────────────────────────────────┘
```

When concurrent modifications collide, `SyncService.activeConflict` emits the diff to `ConflictModalComponent`, letting the user choose which version to preserve.

---

## 5. Attachment Binary Management

1. **Adding an Attachment**:
   - Saved immediately into IndexedDB `attachments` store as a local `Blob` for offline availability.
   - Categorized automatically (`images/`, `documents/`, `bills/`).
2. **Cloud Sync**:
   - Uploads to the appropriate Google Drive folder using multipart binary upload.
   - Receives `driveFileId` from Google Drive API.
   - Updates IndexedDB with `isSynced: true` and `driveFileId`.

