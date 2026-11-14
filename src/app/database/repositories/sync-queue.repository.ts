import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { SyncQueueRecord, SyncAction, SyncEntity } from '../../core/models/sync.model';

@Injectable({
  providedIn: 'root'
})
export class SyncQueueRepository {
  async enqueue(
    entityType: SyncEntity,
    entityId: string,
    action: SyncAction,
    payload?: unknown
  ): Promise<string> {
    const id = uuidv4();
    const record: SyncQueueRecord = {
      id,
      entityType,
      entityId,
      action,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date().toISOString()
    };
    await db.syncQueue.add(record);
    return id;
  }

  async getPending(limit = 50): Promise<SyncQueueRecord[]> {
    return await db.syncQueue
      .where('status')
      .anyOf(['pending', 'failed'])
      .limit(limit)
      .sortBy('createdAt');
  }

  async markSyncing(ids: string[]): Promise<void> {
    await db.transaction('rw', db.syncQueue, async () => {
      for (const id of ids) {
        await db.syncQueue.update(id, {
          status: 'syncing',
          lastAttemptAt: new Date().toISOString()
        });
      }
    });
  }

  async markCompleted(ids: string[]): Promise<void> {
    await db.syncQueue.bulkDelete(ids);
  }

  async recordFailure(id: string, errorMessage: string): Promise<void> {
    const existing = await db.syncQueue.get(id);
    if (existing) {
      await db.syncQueue.update(id, {
        status: 'failed',
        attempts: existing.attempts + 1,
        error: errorMessage,
        lastAttemptAt: new Date().toISOString()
      });
    }
  }

  async countPending(): Promise<number> {
    return await db.syncQueue
      .where('status')
      .anyOf(['pending', 'failed'])
      .count();
  }

  async clearAll(): Promise<void> {
    await db.syncQueue.clear();
  }
}

