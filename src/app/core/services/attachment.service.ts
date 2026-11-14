import { Injectable, inject } from '@angular/core';
import { AttachmentRepository } from '../../database/repositories/attachment.repository';
import { GoogleDriveService } from './google-drive.service';
import { AuthService } from './auth.service';
import { SyncService } from './sync.service';
import { AttachmentRecord, AttachmentCategory } from '../models/sync.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private readonly attachmentRepo = inject(AttachmentRepository);
  private readonly driveService = inject(GoogleDriveService);
  private readonly authService = inject(AuthService);
  private readonly syncService = inject(SyncService);

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
   * Add attachment to an entity (saved locally in Dexie immediately, queued for Drive)
   */
  async addAttachment(
    entityId: string,
    entityType: 'reminder' | 'event',
    file: File,
    categoryHint?: AttachmentCategory
  ): Promise<AttachmentRecord> {
    const category = this.detectCategory(file.type, categoryHint);

    const record = await this.attachmentRepo.add({
      entityId,
      entityType,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category,
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

    const driveFileId = await this.driveService.uploadAttachment(
      record.fileName,
      record.localBlob!,
      record.fileType,
      record.category
    );

    await this.attachmentRepo.updateDriveFileId(record.id, driveFileId);
  }

  /**
   * Get all attachments for an entity
   */
  async getAttachmentsForEntity(entityId: string): Promise<AttachmentRecord[]> {
    return await this.attachmentRepo.getByEntity(entityId);
  }

  /**
   * Get a readable Object URL for an attachment (from local blob, or downloads from Drive if missing)
   */
  async getObjectUrl(record: AttachmentRecord): Promise<string> {
    if (record.localBlob) {
      return URL.createObjectURL(record.localBlob);
    }

    if (record.driveFileId && this.authService.isAuthenticated()) {
      const blob = await this.driveService.downloadBinaryFile(record.driveFileId);
      return URL.createObjectURL(blob);
    }

    throw new Error('Attachment content is unavailable offline and not yet cached.');
  }

  /**
   * Delete an attachment from local DB and Google Drive
   */
  async deleteAttachment(id: string): Promise<void> {
    const record = await this.attachmentRepo.getById(id);
    if (!record) return;

    if (record.driveFileId && this.authService.isAuthenticated() && this.syncService.isOnline()) {
      try {
        await this.driveService.deleteFile(record.driveFileId);
      } catch (e) {
        console.warn('Failed to delete Drive file:', e);
      }
    }

    await this.attachmentRepo.delete(id);
    await this.syncService.recordLocalChange('attachment', id, 'delete');
  }
}

