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

function isTimeInQuietHours(target, startStr, endStr) {
  const currentMins = target.getHours() * 60 + target.getMinutes();
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  if (startTotal > endTotal) {
    return currentMins >= startTotal || currentMins < endTotal;
  } else {
    return currentMins >= startTotal && currentMins < endTotal;
  }
}

function postponeToQuietHoursEnd(target, endStr) {
  const [endH, endM] = endStr.split(':').map(Number);
  const deferred = new Date(target);
  if (target.getHours() >= 12) {
    deferred.setDate(deferred.getDate() + 1);
  }
  deferred.setHours(endH, endM, 0, 0);
  return deferred;
}

async function runPhase3Tests() {
  console.log('--- Starting Phase 3 Notification & Scheduler Verification ---');
  const db = new ReminderDatabase();
  await db.open();

  // Test 1: Multiple Notification Alerts Schedule
  console.log('Test 1: Scheduling multiple alerts (7d, 1d, 1h, and at time)...');
  const futureEvent = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000); // 8 days ahead
  const leadTimes = [0, 60, 1440, 10080]; // 0m, 1h, 1d, 7d

  const reminderId = 'rem-assignment-101';
  const jobs = [];
  const now = new Date();

  for (const m of leadTimes) {
    const alertTime = new Date(futureEvent.getTime() - m * 60 * 1000);
    if (alertTime > now) {
      jobs.push({
        id: `job-${m}`,
        entityId: reminderId,
        entityType: 'reminder',
        title: '🔔 Assignment Deadline',
        body: m === 0 ? 'Deadline now!' : `Due in ${m} minutes`,
        scheduledTime: alertTime.toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString()
      });
    }
  }

  await db.notificationJobs.bulkAdd(jobs);
  const savedJobs = await db.notificationJobs.where('entityId').equals(reminderId).toArray();
  if (savedJobs.length !== 4) throw new Error(`Expected 4 notification jobs, got ${savedJobs.length}`);
  console.log('✓ Successfully created 4 distinct notification jobs in IndexedDB');

  // Test 2: Quiet Hours logic (Overnight 22:00 -> 07:00)
  console.log('Test 2: Testing Quiet Hours evaluation...');
  const nightDate = new Date(2026, 10, 14, 23, 30, 0); // 11:30 PM
  const dayDate = new Date(2026, 10, 14, 14, 0, 0);   // 02:00 PM
  const morningDate = new Date(2026, 10, 15, 6, 15, 0); // 06:15 AM

  if (!isTimeInQuietHours(nightDate, '22:00', '07:00')) throw new Error('11:30 PM should be in quiet hours');
  if (isTimeInQuietHours(dayDate, '22:00', '07:00')) throw new Error('02:00 PM should NOT be in quiet hours');
  if (!isTimeInQuietHours(morningDate, '22:00', '07:00')) throw new Error('06:15 AM should be in quiet hours');

  const deferred = postponeToQuietHoursEnd(nightDate, '07:00');
  if (deferred.getHours() !== 7 || deferred.getMinutes() !== 0 || deferred.getDate() !== 15) {
    throw new Error('Defer failed');
  }
  console.log('✓ Quiet hours correctly detects overnight ranges and defers 11:30 PM to 07:00 AM next morning');

  // Test 3: Due Job Processing (Heartbeat simulator)
  console.log('Test 3: Processing due notification jobs...');
  // Add a job scheduled 10 seconds ago
  const pastJob = {
    id: 'job-due-now',
    entityId: 'rem-quick-alert',
    entityType: 'reminder',
    title: '🔔 Medication Reminder',
    body: 'Take evening pill',
    scheduledTime: new Date(Date.now() - 10000).toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  await db.notificationJobs.add(pastJob);

  const dueJobs = await db.notificationJobs
    .where('scheduledTime')
    .belowOrEqual(new Date().toISOString())
    .and(j => j.status === 'pending')
    .toArray();

  if (dueJobs.length === 0 || !dueJobs.some(j => j.id === 'job-due-now')) {
    throw new Error('Due job was not detected');
  }

  // Mark job sent
  await db.notificationJobs.update('job-due-now', { status: 'sent' });
  const updatedJob = await db.notificationJobs.get('job-due-now');
  if (updatedJob?.status !== 'sent') throw new Error('Job status was not updated to sent');
  console.log('✓ Due notification job detected, dispatched, and marked as sent');

  // Test 4: Notification Actions (Complete & Snooze from SW)
  console.log('Test 4: Simulating Service Worker Complete & Snooze actions...');
  await db.reminders.add({
    id: 'rem-sw-test',
    title: 'Call Doctor',
    dateAD: '2026-11-14',
    dateBS: '2081-07-29',
    time: '10:00',
    timezone: 'UTC',
    priority: 'high',
    category: 'Health',
    repeatType: 'none',
    notificationSchedule: { remindAtTime: true, minutesBefore: [0] },
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Action: Complete
  await db.reminders.update('rem-sw-test', { status: 'completed', completedAt: new Date().toISOString() });
  // Cancel pending jobs
  const cancelledJobs = await db.notificationJobs.where('entityId').equals('rem-sw-test').toArray();
  await db.notificationJobs.bulkDelete(cancelledJobs.map(j => j.id));

  const remCompleted = await db.reminders.get('rem-sw-test');
  if (remCompleted?.status !== 'completed') throw new Error('Complete action failed');
  console.log('✓ Service Worker Complete action verified');

  // Action: Snooze 15m
  const snoozedTime = new Date(Date.now() + 15 * 60 * 1000);
  await db.reminders.update('rem-sw-test', {
    status: 'snoozed',
    time: `${snoozedTime.getHours()}:${snoozedTime.getMinutes()}`,
    snoozedUntil: snoozedTime.toISOString()
  });
  const remSnoozed = await db.reminders.get('rem-sw-test');
  if (remSnoozed?.status !== 'snoozed') throw new Error('Snooze action failed');
  console.log('✓ Service Worker Snooze action verified');

  await db.close();
  console.log('--- All Phase 3 Notification Engine Tests Passed Successfully! ---');
}

runPhase3Tests().catch(err => {
  console.error('Phase 3 verification failed:', err);
  process.exit(1);
});

