import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { SettingRecord } from '../../core/models/settings.model';
import { db } from '../db';

@Injectable({
  providedIn: 'root'
})
export class SettingsRepository extends BaseRepository<SettingRecord, string> {
  constructor() {
    super(db.settings);
  }

  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    const record = await this.table.get(key);
    return record ? (record.value as T) : defaultValue;
  }

  async setSetting<T>(key: string, value: T): Promise<string> {
    return this.table.put({ key, value });
  }
}
