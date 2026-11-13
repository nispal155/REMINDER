import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { Birthday } from '../../core/models/birthday.model';
import { db } from '../db';

@Injectable({
  providedIn: 'root'
})
export class BirthdayRepository extends BaseRepository<Birthday, string> {
  constructor() {
    super(db.birthdays);
  }

  async getBirthdaysForDate(dateAD: string): Promise<Birthday[]> {
    return this.table.where('dateAD').equals(dateAD).toArray();
  }
}
