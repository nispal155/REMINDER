import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import { Dexie } from 'dexie';

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

async function verify() {
  console.log('Testing Dexie ReminderDatabase schema...');
  const db = new ReminderDatabase();
  await db.open();

  console.log('Database opened successfully. Table count:', db.tables.length);
  const tableNames = db.tables.map(t => t.name);
  console.log('Tables:', tableNames.join(', '));

  // 1. Insert Reminder
  const reminder = {
    id: 'rem-101',
    title: 'Doctors Checkup',
    description: 'Routine blood test and vitals',
    dateAD: '2026-11-14',
    dateBS: '2081-07-29',
    time: '09:30',
    timezone: 'Asia/Kathmandu',
    priority: 'urgent',
    category: 'Health',
    repeatType: 'none',
    notificationSchedule: { remindAtTime: true, minutesBefore: [15] },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await db.reminders.add(reminder);
  console.log('✓ Reminder inserted:', reminder.title);

  // 2. Query Reminder by ID
  const fetched = await db.reminders.get('rem-101');
  if (fetched?.title !== 'Doctors Checkup') throw new Error('Fetch failed');
  console.log('✓ Fetched reminder matches title');

  // 3. Update status
  await db.reminders.update('rem-101', { status: 'completed' });
  const updated = await db.reminders.get('rem-101');
  if (updated?.status !== 'completed') throw new Error('Update failed');
  console.log('✓ Updated reminder status to completed');

  // 4. Test Birthday
  await db.birthdays.add({
    id: 'bday-1',
    name: 'Suman Shrestha',
    dateAD: '2026-11-14',
    dateBS: '2081-07-29',
    relationship: 'family',
    notes: 'Likes books',
    notificationSchedule: { onDay: true, daysBefore: [1], time: '09:00' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const bdayCount = await db.birthdays.count();
  console.log('✓ Birthday count:', bdayCount);

  // 5. Test Settings
  await db.settings.put({ key: 'theme', value: 'dark' });
  const theme = await db.settings.get('theme');
  console.log('✓ Setting retrieved:', theme.value);

  await db.close();
  console.log('All Dexie IndexedDB assertions passed successfully!');
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
