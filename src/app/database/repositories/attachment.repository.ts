import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { AttachmentRecord, AttachmentCategory } from '../../core/models/sync.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentRepository {
  async add(record: Omit<AttachmentRecord, 'id' | 'createdAt'> & { id?: string }): Promise<AttachmentRecord> {
    const fullRecord: AttachmentRecord = {
      ...record,
      id: record.id || uuidv4(),
      createdAt: new Date().toISOString()
    };
    await db.attachments.add(fullRecord);
    return fullRecord;
  }

  async getById(id: string): Promise<AttachmentRecord | undefined> {
    return await db.attachments.get(id);
  }

  async getByEntity(entityId: string): Promise<AttachmentRecord[]> {
    return await db.attachments.where('entityId').equals(entityId).toArray();
  }

  async getUnsynced(): Promise<AttachmentRecord[]> {
    return await db.attachments.where('isSynced').equals(0 as unknown as string).toArray();
  }

  async updateDriveFileId(id: string, driveFileId: string): Promise<void> {
    await db.attachments.update(id, {
      driveFileId,
      isSynced: true,
      updatedAt: new Date().toISOString()
    });
  }

  async delete(id: string): Promise<void> {
    await db.attachments.delete(id);
  }

  async deleteByEntity(entityId: string): Promise<void> {
    const records = await this.getByEntity(entityId);
    const ids = records.map(r => r.id);
    await db.attachments.bulkDelete(ids);
  }

  async getAll(): Promise<AttachmentRecord[]> {
    return await db.attachments.toArray();
  }

  async clearAll(): Promise<void> {
    await db.attachments.clear();
  }
}

