import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { NotificationJobRecord } from '../../core/models/sync.model';
import { db } from '../db';

@Injectable({
  providedIn: 'root'
})
export class NotificationJobRepository extends BaseRepository<NotificationJobRecord, string> {
  constructor() {
    super(db.notificationJobs);
  }

  async getDueJobs(nowIso: string): Promise<NotificationJobRecord[]> {
    return this.table
      .where('scheduledTime')
      .belowOrEqual(nowIso)
      .and(j => j.status === 'pending')
      .toArray();
  }

  async getPendingJobsForEntity(entityId: string): Promise<NotificationJobRecord[]> {
    return this.table
      .where('entityId')
      .equals(entityId)
      .and(j => j.status === 'pending')
      .toArray();
  }

  async deleteJobsForEntity(entityId: string): Promise<void> {
    const jobs = await this.table.where('entityId').equals(entityId).toArray();
    const ids = jobs.map(j => j.id);
    await this.table.bulkDelete(ids);
  }

  async markJobSent(id: string): Promise<void> {
    await this.table.update(id, { status: 'sent' });
  }
}
