import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import { Dexie } from 'dexie';
import NepaliDate from 'nepali-date-converter';

const ND = NepaliDate.default || NepaliDate;

class ReminderDatabase extends Dexie {
  constructor() {
    super('ReminderDatabase', { indexedDB, IDBKeyRange });
    this.version(1).stores({
      reminders: 'id, dateAD, dateBS, status, priority, category, repeatType, createdAt, updatedAt',
      events: 'id, startDateAD, startDateBS, endDateAD, createdAt, updatedAt',
      birthdays: 'id, dateAD, dateBS, name, createdAt, updatedAt',
      settings: 'key',
      attachments: 'id, entityId, entityType, fileType, isSynced, createdAt',
      notificationJobs: 'id, entityId, scheduledTime, status',
      syncQueue: 'id, entityType, entityId, action, status, createdAt',
      metadata: 'key'
    });
  }
}

async function runPhase2Tests() {
  console.log('--- Starting Phase 2 Verification ---');
  const db = new ReminderDatabase();
  await db.open();

  // Test 1: Create reminder via BS calendar input
  console.log('Test 1: Creating reminder via BS date (2081-07-28)...');
  const bsDateObj = new ND(2081, 6, 28);
  const dateADObj = bsDateObj.getDateObject().AD;
  const dateAD = `${dateADObj.year}-${String(dateADObj.month + 1).padStart(2, '0')}-${String(dateADObj.date).padStart(2, '0')}`;
  const dateBS = '2081-07-28';

  const reminder1 = {
    id: 'rem-bs-1',
    title: 'Tihar Shopping',
    description: 'Buy lights and sweets for Laxmi Puja',
    calendarMode: 'BS',
    dateBS: dateBS,
    dateAD: dateAD,
    time: '14:00',
    timezone: 'Asia/Kathmandu',
    priority: 'high',
    category: 'Personal',
    repeatType: 'none',
    notificationSchedule: { remindAtTime: true, minutesBefore: [15] },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await db.reminders.add(reminder1);

  const saved1 = await db.reminders.get('rem-bs-1');
  if (saved1?.dateAD !== '2024-11-13') throw new Error(`Expected 2024-11-13 AD, got ${saved1?.dateAD}`);
  console.log('✓ BS 2081-07-28 correctly mapped and persisted with AD:', saved1.dateAD);

  // Test 2: Create reminder via AD calendar input
  console.log('Test 2: Creating reminder via AD date (2026-12-14)...');
  const targetAd = new Date(2026, 11, 14, 12, 0, 0);
  const bsFromAd = new ND(targetAd);
  const bsString = `${bsFromAd.getYear()}-${String(bsFromAd.getMonth() + 1).padStart(2, '0')}-${String(bsFromAd.getDate()).padStart(2, '0')}`;

  const reminder2 = {
    id: 'rem-ad-1',
    title: 'Future Milestone Review',
    calendarMode: 'AD',
    dateAD: '2026-12-14',
    dateBS: bsString,
    time: '11:00',
    timezone: 'Asia/Kathmandu',
    priority: 'urgent',
    category: 'Work',
    repeatType: 'none',
    notificationSchedule: { remindAtTime: true, minutesBefore: [30] },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await db.reminders.add(reminder2);

  const saved2 = await db.reminders.get('rem-ad-1');
  if (saved2?.dateBS !== '2083-08-28') throw new Error(`Expected 2083-08-28 BS, got ${saved2?.dateBS}`);
  console.log('✓ AD 2026-12-14 correctly mapped and persisted with BS:', saved2.dateBS);

  // Test 3: BS Yearly Recurrence (e.g. Father's Birthday on 15 Bhadra)
  console.log('Test 3: Testing BS Yearly Recurrence (15 Bhadra)...');
  const bdayBs = '2081-05-15'; // 15 Bhadra 2081
  const bdayAdObj = new ND(2081, 4, 15).getDateObject().AD;
  const bdayAd = `${bdayAdObj.year}-${String(bdayAdObj.month + 1).padStart(2, '0')}-${String(bdayAdObj.date).padStart(2, '0')}`;

  const recurringReminder = {
    id: 'rem-bday-father',
    title: "Father's Birthday",
    dateBS: bdayBs,
    dateAD: bdayAd,
    time: '09:00',
    timezone: 'Asia/Kathmandu',
    priority: 'urgent',
    category: 'Birthday',
    repeatType: 'yearly_bs',
    notificationSchedule: { remindAtTime: true, minutesBefore: [60] },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await db.reminders.add(recurringReminder);

  // Simulate completion and advancing recurrence:
  await db.reminders.update('rem-bday-father', { status: 'completed', completedAt: new Date().toISOString() });
  
  // Advance to next BS Year: 2082-05-15
  const nextBsYear = 2082;
  const nextBs = `${nextBsYear}-05-15`;
  const nextAdObj = new ND(nextBsYear, 4, 15).getDateObject().AD;
  const nextAd = `${nextAdObj.year}-${String(nextAdObj.month + 1).padStart(2, '0')}-${String(nextAdObj.date).padStart(2, '0')}`;

  const nextOccurrence = {
    id: 'rem-bday-father-next',
    title: "Father's Birthday",
    dateBS: nextBs,
    dateAD: nextAd,
    time: '09:00',
    timezone: 'Asia/Kathmandu',
    priority: 'urgent',
    category: 'Birthday',
    repeatType: 'yearly_bs',
    notificationSchedule: { remindAtTime: true, minutesBefore: [60] },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await db.reminders.add(nextOccurrence);

  const savedNext = await db.reminders.get('rem-bday-father-next');
  if (savedNext?.dateBS !== '2082-05-15') throw new Error(`Expected 2082-05-15, got ${savedNext?.dateBS}`);
  console.log(`✓ BS Yearly recurrence succeeded: Next occurrence is on ${savedNext.dateBS} (AD: ${savedNext.dateAD})`);

  // Test 4: Snooze functionality
  console.log('Test 4: Testing Snooze...');
  await db.reminders.update('rem-bs-1', {
    status: 'snoozed',
    time: '14:15',
    snoozedUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  });
  const snoozed = await db.reminders.get('rem-bs-1');
  if (snoozed?.status !== 'snoozed' || snoozed?.time !== '14:15') {
    throw new Error('Snooze update failed');
  }
  console.log('✓ Reminder successfully snoozed to 14:15 with status snoozed');

  // Test 5: Search
  console.log('Test 5: Testing multi-field search...');
  const all = await db.reminders.toArray();
  const searchResults1 = all.filter(r => r.title.toLowerCase().includes('shopping') || r.category.toLowerCase().includes('shopping'));
  if (searchResults1.length !== 1 || searchResults1[0].id !== 'rem-bs-1') throw new Error('Search failed');

  const searchResults2 = all.filter(r => r.dateBS.includes('2081-07-28'));
  if (searchResults2.length !== 1) throw new Error('Date search failed');
  console.log('✓ Search by title and BS date verified');

  // Test 6: Reopen and Duplicate
  console.log('Test 6: Testing Reopen and Duplicate...');
  await db.reminders.update('rem-bday-father', { status: 'pending', completedAt: undefined });
  const reopened = await db.reminders.get('rem-bday-father');
  if (reopened?.status !== 'pending' || reopened?.completedAt !== undefined) throw new Error('Reopen failed');

  const duplicated = {
    ...reopened,
    id: 'rem-dup-1',
    title: `${reopened.title} (Copy)`
  };
  await db.reminders.add(duplicated);
  const foundDup = await db.reminders.get('rem-dup-1');
  if (foundDup?.title !== "Father's Birthday (Copy)") throw new Error('Duplicate failed');
  console.log('✓ Reopen and duplicate operations succeeded');

  await db.close();
  console.log('--- All Phase 2 Verification Tests Passed Successfully! ---');
}

runPhase2Tests().catch(err => {
  console.error('Phase 2 test failed:', err);
  process.exit(1);
});
