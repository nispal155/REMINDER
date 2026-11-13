import { Injectable, inject, signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Birthday, RelationshipType } from '../../core/models/birthday.model';
import { BirthdayRepository } from '../../database/repositories/birthday.repository';
import { IndexedDbService } from '../../core/services/indexed-db.service';
import { ToastService } from '../../core/services/toast.service';

export interface CreateBirthdayDTO {
  name: string;
  dateAD: string;
  dateBS?: string;
  relationship: RelationshipType;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BirthdayService {
  private readonly birthdayRepo = inject(BirthdayRepository);
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly toast = inject(ToastService);

  readonly birthdays = signal<Birthday[]>([]);

  constructor() {
    this.indexedDbService.observe(() => this.birthdayRepo.getAll()).subscribe({
      next: (items) => this.birthdays.set(items),
      error: (err) => console.error('Error observing birthdays:', err)
    });
  }

  async addBirthday(dto: CreateBirthdayDTO): Promise<Birthday> {
    const newBirthday: Birthday = {
      id: uuidv4(),
      name: dto.name.trim(),
      dateAD: dto.dateAD,
      dateBS: dto.dateBS || '2081-07-28',
      relationship: dto.relationship,
      notes: dto.notes?.trim(),
      notificationSchedule: {
        onDay: true,
        daysBefore: [1],
        time: '09:00'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.birthdayRepo.create(newBirthday);
    this.toast.success(`Birthday for ${newBirthday.name} saved!`);
    return newBirthday;
  }

  async deleteBirthday(id: string): Promise<void> {
    await this.birthdayRepo.delete(id);
    this.toast.info('Birthday removed');
  }
}

