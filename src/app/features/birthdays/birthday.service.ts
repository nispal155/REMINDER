import { Injectable, inject, signal, computed } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import {
  Birthday,
  BirthdayWithCountdown,
  RelationshipType,
  MilestoneType,
  BirthdayNotificationConfig
} from '../../core/models/birthday.model';
import { BirthdayRepository } from '../../database/repositories/birthday.repository';
import { IndexedDbService } from '../../core/services/indexed-db.service';
import { NepaliCalendarService } from '../../core/services/nepali-calendar.service';
import { SyncService } from '../../core/services/sync.service';
import { ToastService } from '../../core/services/toast.service';

export interface CreateBirthdayDTO {
  name: string;
  type?: MilestoneType;
  dateAD: string;
  dateBS: string;
  calendarMode?: 'BS' | 'AD';
  relationship: RelationshipType;
  notes?: string;
  notificationSchedule?: BirthdayNotificationConfig;
}

@Injectable({
  providedIn: 'root'
})
export class BirthdayService {
  private readonly birthdayRepo = inject(BirthdayRepository);
  private readonly indexedDbService = inject(IndexedDbService);
  private readonly nepaliCalendar = inject(NepaliCalendarService);
  private readonly syncService = inject(SyncService);
  private readonly toast = inject(ToastService);

  readonly allBirthdays = signal<Birthday[]>([]);

  // Computed birthdays with countdown, age calculation, and chronological sorting
  readonly birthdaysWithCountdown = computed<BirthdayWithCountdown[]>(() => {
    const list = this.allBirthdays();
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();
    const todayStart = new Date(todayYear, todayMonth, todayDate).getTime();

    const todayBs = this.nepaliCalendar.adToBs(now);

    return list.map(item => {
      const mode = item.calendarMode || 'AD';
      let nextOccurDate: Date;
      let nextBsStr = '';
      let nextAdStr = '';

      if (mode === 'BS' && item.dateBS) {
        // BS Recurrence: Same BS Month & Day every BS Year
        const [bYear, bMonth, bDay] = item.dateBS.split('-').map(Number);
        let targetBsYear = todayBs.year;

        // Check if BS birthday already occurred this BS year
        if (todayBs.month > bMonth || (todayBs.month === bMonth && todayBs.day > bDay)) {
          targetBsYear += 1;
        }

        const maxDays = this.nepaliCalendar.getDaysInBsMonth(targetBsYear, bMonth);
        const validDay = Math.min(bDay, maxDays);

        const bsDateObj = { year: targetBsYear, month: bMonth, day: validDay };
        nextOccurDate = this.nepaliCalendar.bsToAd(bsDateObj);
        nextBsStr = this.nepaliCalendar.formatBsIso(bsDateObj);
        nextAdStr = this.nepaliCalendar.formatAdIso(nextOccurDate);
      } else {
        // AD Recurrence: Same AD Month & Day every AD Year
        const [bYear, bMonth, bDay] = item.dateAD.split('-').map(Number);
        let targetYear = todayYear;
        const candidateDate = new Date(targetYear, bMonth - 1, bDay);

        if (candidateDate.getTime() < todayStart) {
          targetYear += 1;
        }

        nextOccurDate = new Date(targetYear, bMonth - 1, bDay);
        nextAdStr = this.nepaliCalendar.formatAdIso(nextOccurDate);
        nextBsStr = this.nepaliCalendar.formatBsIso(this.nepaliCalendar.adToBs(nextOccurDate));
      }

      // Calculate days remaining
      const occurStart = new Date(nextOccurDate.getFullYear(), nextOccurDate.getMonth(), nextOccurDate.getDate()).getTime();
      const diffMs = occurStart - todayStart;
      const daysRemaining = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));

      const isToday = daysRemaining === 0;
      const isTomorrow = daysRemaining === 1;

      // Age calculation
      let currentAge: number | undefined;
      let milestoneYears: number | undefined;

      if (item.dateAD) {
        const originYear = Number(item.dateAD.split('-')[0]);
        const calcYear = nextOccurDate.getFullYear();
        if (originYear && calcYear >= originYear) {
          const yearsDiff = calcYear - originYear;
          if (item.type === 'anniversary') {
            milestoneYears = yearsDiff;
          } else {
            currentAge = yearsDiff;
          }
        }
      }

      return {
        ...item,
        type: item.type || 'birthday',
        currentAge,
        milestoneYears,
        daysRemaining,
        isToday,
        isTomorrow,
        nextOccurrenceAD: nextAdStr,
        nextOccurrenceBS: nextBsStr
      };
    }).sort((a, b) => a.daysRemaining - b.daysRemaining);
  });

  constructor() {
    this.indexedDbService.observe(() => this.birthdayRepo.getAll()).subscribe({
      next: (items) => this.allBirthdays.set(items),
      error: (err) => console.error('Error observing birthdays:', err)
    });
  }

  async addBirthday(dto: CreateBirthdayDTO): Promise<Birthday> {
    const newBirthday: Birthday = {
      id: uuidv4(),
      name: dto.name.trim(),
      type: dto.type || 'birthday',
      dateAD: dto.dateAD,
      dateBS: dto.dateBS,
      calendarMode: dto.calendarMode || 'BS',
      relationship: dto.relationship,
      notes: dto.notes?.trim(),
      notificationSchedule: dto.notificationSchedule || {
        onDay: true,
        daysBefore: [1, 3],
        time: '09:00'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.birthdayRepo.create(newBirthday);
    await this.syncService.recordLocalChange('birthday', newBirthday.id, 'create', newBirthday);
    this.toast.success(`${newBirthday.type === 'anniversary' ? 'Anniversary' : 'Birthday'} for ${newBirthday.name} saved!`);
    return newBirthday;
  }

  async updateBirthday(id: string, changes: Partial<Birthday>): Promise<void> {
    await this.birthdayRepo.update(id, {
      ...changes,
      updatedAt: new Date().toISOString()
    });
    const updated = await this.birthdayRepo.getById(id);
    if (updated) {
      await this.syncService.recordLocalChange('birthday', id, 'update', updated);
    }
    this.toast.success('Updated successfully');
  }

  async deleteBirthday(id: string): Promise<void> {
    await this.birthdayRepo.delete(id);
    await this.syncService.recordLocalChange('birthday', id, 'delete');
    this.toast.info('Item removed');
  }
}
