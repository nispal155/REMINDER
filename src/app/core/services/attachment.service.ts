import { Injectable, inject } from '@angular/core';
import { db } from '../../database/db';
import { AttachmentRepository } from '../../database/repositories/attachment.repository';
import { GoogleDriveService } from './google-drive.service';
import { AuthService } from './auth.service';
import { SyncService } from './sync.service';
import { AttachmentRecord, AttachmentCategory } from '../models/sync.model';

// Security Constraints
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;    // 10 MB limit
export const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20 MB limit

export const ALLOWED_EXTENSIONS = new Set<string>([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg',
  'pdf', 'txt', 'docx', 'xlsx', 'csv', 'json'
]);

export const BLOCKED_EXTENSIONS = new Set<string>([
  'exe', 'sh', 'bat', 'cmd', 'js', 'vbs', 'msi', 'jar', 'apk', 'com', 'bin', 'scr', 'pif', 'reg', 'ps1', 'php', 'py'
]);

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private readonly attachmentRepo = inject(AttachmentRepository);
  private readonly driveService = inject(GoogleDriveService);
  private readonly authService = inject(AuthService);
  private readonly syncService = inject(SyncService);

  /**
   * Sanitize filename to prevent directory traversal and script injection
   */
  sanitizeFileName(rawName: string): string {
    if (!rawName) return 'unnamed_file';
    // Strip path traversal sequences
    const base = rawName.replace(/^.*[\\\/]/, '').trim();
    // Allow alphanumeric, dots, dashes, and underscores only
    const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
    return cleaned || 'attachment';
  }

  /**
   * Validate file against security policies (MIME, extension, size, executable detection)
   */
  validateFile(file: File, categoryHint?: AttachmentCategory): { valid: boolean; error?: string; category: AttachmentCategory } {
    const rawExt = file.name.split('.').pop()?.toLowerCase() || '';

    // 1. Check blocked dangerous executable extensions
    if (BLOCKED_EXTENSIONS.has(rawExt)) {
      return {
        valid: false,
        error: `Security Violation: Executable file types (.${rawExt}) are strictly prohibited.`,
        category: 'documents'
      };
    }

    // 2. Check allowed extensions
    if (rawExt && !ALLOWED_EXTENSIONS.has(rawExt)) {
      return {
        valid: false,
        error: `File type .${rawExt} is not supported. Please upload an image or document.`,
        category: 'documents'
      };
    }

    // 3. Category detection & size limits
    const category = this.detectCategory(file.type, categoryHint);

    if (category === 'images') {
      if (file.size > MAX_IMAGE_SIZE) {
        return {
          valid: false,
          error: `Image size exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
          category
        };
      }
    } else {
      if (file.size > MAX_DOCUMENT_SIZE) {
        return {
          valid: false,
          error: `Document size exceeds the 20 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
          category
        };
      }
    }

    return { valid: true, category };
  }

  /**
   * Determine the appropriate storage category based on MIME type or hint
   */
  detectCategory(fileType: string, categoryHint?: AttachmentCategory): AttachmentCategory {
    if (categoryHint) return categoryHint;
    if (fileType.startsWith('image/')) return 'images';
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('sheet') || fileType.includes('text')) {
      return 'documents';
    }
    return 'documents';
  }

  /**
   * Add attachment to an entity (validates security, saves locally in Dexie, queues for Drive)
   */
  async addAttachment(
    entityId: string,
    entityType: 'reminder' | 'event',
    file: File,
    categoryHint?: AttachmentCategory
  ): Promise<AttachmentRecord> {
    const validation = this.validateFile(file, categoryHint);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file.');
    }

    const safeName = this.sanitizeFileName(file.name);

    const record = await this.attachmentRepo.add({
      entityId,
      entityType,
      fileName: safeName,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      category: validation.category,
      localBlob: file,
      isSynced: false
    });

    // Enqueue in sync
    await this.syncService.recordLocalChange('attachment', record.id, 'create');

    // If online and authenticated, trigger upload
    if (this.authService.isAuthenticated() && this.syncService.isOnline()) {
      this.uploadSingleAttachment(record).catch(err => {
        console.warn('Background attachment upload failed:', err);
      });
    }

    return record;
  }

  /**
   * Upload an individual attachment to Google Drive
   */
  async uploadSingleAttachment(record: AttachmentRecord): Promise<void> {
    if (!record.localBlob) {
      const refreshed = await this.attachmentRepo.getById(record.id);
      if (!refreshed?.localBlob) return;
      record = refreshed;
    }

    try {
      const driveFileId = await this.driveService.uploadAttachment(
        record.fileName,
        record.localBlob!,
        record.fileType,
        record.category
      );

      await this.attachmentRepo.updateDriveFileId(record.id, driveFileId);
    } catch (err) {
      console.error('Attachment upload failed:', err);
      throw err;
    }
  }

  /**
   * Download attachment binary from Google Drive and cache in local Dexie
   */
  async fetchAndCacheBinary(recordId: string): Promise<Blob | null> {
    const record = await this.attachmentRepo.getById(recordId);
    if (!record) return null;

    if (record.localBlob) {
      return record.localBlob;
    }

    if (!record.driveFileId || !this.authService.isAuthenticated()) {
      return null;
    }

    try {
      const blob = await this.driveService.downloadBinaryFile(record.driveFileId);
      await db.attachments.update(recordId, { localBlob: blob });
      return blob;
    } catch (err) {
      console.error(`Failed to download attachment ${recordId}:`, err);
      return null;
    }
  }

  /**
   * Delete attachment locally and on Google Drive
   */
  async deleteAttachment(recordId: string): Promise<void> {
    const record = await this.attachmentRepo.getById(recordId);
    if (!record) return;

    if (record.driveFileId && this.authService.isAuthenticated()) {
      try {
        await this.driveService.deleteFile(record.driveFileId);
      } catch (err) {
        console.warn('Failed to delete Google Drive attachment file:', err);
      }
    }

    await this.attachmentRepo.delete(recordId);
    await this.syncService.recordLocalChange('attachment', recordId, 'delete');
  }
}
