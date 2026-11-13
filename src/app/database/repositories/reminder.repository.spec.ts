import { TestBed } from '@angular/core/testing';
import { ReminderRepository } from './reminder.repository';
import { db } from '../db';
import { Reminder } from '../../core/models/reminder.model';

describe('ReminderRepository', () => {
  let repo: ReminderRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReminderRepository]
    });
    repo = TestBed.inject(ReminderRepository);
  });

  afterEach(async () => {
    await db.reminders.clear();
  });

  it('should be initialized and define tables', () => {
    expect(repo).toBeTruthy();
    expect(db.reminders).toBeDefined();
    expect(db.events).toBeDefined();
    expect(db.birthdays).toBeDefined();
    expect(db.settings).toBeDefined();
  });

  it('should create and retrieve reminders', async () => {
    const item: Reminder = {
      id: 'test-rem-1',
      title: 'Doctor Appointment',
      dateAD: '2026-11-14',
      dateBS: '2081-07-29',
      time: '11:00',
      timezone: 'UTC',
      priority: 'high',
      category: 'Health',
      repeatType: 'none',
      notificationSchedule: { remindAtTime: true, minutesBefore: [15] },
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await repo.create(item);
    const retrieved = await repo.getById('test-rem-1');
    expect(retrieved).toBeDefined();
    expect(retrieved?.title).toBe('Doctor Appointment');
  });
});
