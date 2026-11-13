import { Injectable, inject, OnDestroy } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Reminder } from '../models/reminder.model';
import { NotificationJobRecord } from '../models/sync.model';
import { NotificationJobRepository } from '../../database/repositories/notification-job.repository';
import { NotificationService } from './notification.service';
import { SettingsRepository } from '../../database/repositories/settings.repository';
import { QuietHoursConfig } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderSchedulerService implements OnDestroy {
  private readonly jobRepo = inject(NotificationJobRepository);
  private readonly notificationService = inject(NotificationService);
  private readonly settingsRepo = inject(SettingsRepository);

  private heartbeatTimer: any;
  private isProcessing = false;

  constructor() {
    this.startHeartbeat();
    this.listenToVisibility();
  }

  ngOnDestroy() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  }

  private startHeartbeat() {
    // Run inspection every 20 seconds
    this.heartbeatTimer = setInterval(() => {
      this.processDueNotificationJobs();
    }, 20000);
    // Initial check on load
    this.processDueNotificationJobs();
  }

  private listenToVisibility() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.processDueNotificationJobs();
        }
      });
    }
  }

  /**
   * Schedule jobs for a newly created or updated reminder
   */
  async scheduleJobsForReminder(reminder: Reminder): Promise<void> {
    // 1. Clear existing pending jobs for this reminder
    await this.cancelJobsForReminder(reminder.id);

    // If completed or dismissed, do not schedule future alerts
    if (reminder.status === 'completed' || reminder.status === 'dismissed') {
      return;
    }

    const quietHours = await this.settingsRepo.getSetting<QuietHoursConfig>('quietHours', {
      enabled: false,
      startTime: '22:00',
      endTime: '07:00',
      mode: 'silent'
    });

    const notifEnabled = await this.settingsRepo.getSetting<boolean>('notificationsEnabled', true);
    if (!notifEnabled) {
      return;
    }

    // 2. Parse exact event datetime
    const dateParts = reminder.dateAD.split('-').map(Number);
    const timeParts = reminder.time.split(':').map(Number);
    const eventTime = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], 0);

    const leadTimes = reminder.notificationSchedule?.minutesBefore || [0];
    const now = new Date();
    const jobs: NotificationJobRecord[] = [];

    for (const minutesBefore of leadTimes) {
      const scheduledAlertTime = new Date(eventTime.getTime() - minutesBefore * 60 * 1000);

      // Only schedule future alerts
      if (scheduledAlertTime > now) {
        let isSilent = false;
        let finalAlertTime = scheduledAlertTime;

        // Check Quiet Hours
        if (quietHours.enabled && this.isTimeInQuietHours(finalAlertTime, quietHours.startTime, quietHours.endTime)) {
          if (reminder.priority !== 'urgent') {
            if (quietHours.mode === 'silent') {
              isSilent = true;
            } else if (quietHours.mode === 'defer') {
              finalAlertTime = this.postponeToQuietHoursEnd(finalAlertTime, quietHours.endTime);
            }
          }
        }

        const leadText = minutesBefore === 0
          ? 'now'
          : minutesBefore < 60
            ? `in ${minutesBefore}m`
            : minutesBefore < 1440
              ? `in ${Math.round(minutesBefore / 60)}h`
              : `in ${Math.round(minutesBefore / 1440)}d`;

        jobs.push({
          id: uuidv4(),
          entityId: reminder.id,
          entityType: 'reminder',
          title: `🔔 ${reminder.title}`,
          body: minutesBefore === 0
            ? `It's time: ${reminder.time} (${reminder.category})`
            : `Starting ${leadText} at ${reminder.time}`,
          scheduledTime: finalAlertTime.toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
    }

    for (const job of jobs) {
      await this.jobRepo.create(job);
    }
  }

  /**
   * Cancel all pending notification jobs for a reminder
   */
  async cancelJobsForReminder(reminderId: string): Promise<void> {
    await this.jobRepo.deleteJobsForEntity(reminderId);
  }

  /**
   * Rebuild all notification jobs from a full list of reminders (e.g. after restore)
   */
  async rebuildAllJobs(reminders: Reminder[]): Promise<void> {
    await this.jobRepo.clear();
    for (const r of reminders) {
      await this.scheduleJobsForReminder(r);
    }
  }

  /**
   * Process and dispatch due notifications from IndexedDB
   */
  async processDueNotificationJobs(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const nowIso = new Date().toISOString();
      const dueJobs = await this.jobRepo.getDueJobs(nowIso);

      const sound = await this.settingsRepo.getSetting<boolean>('notificationSound', true);
      const vibration = await this.settingsRepo.getSetting<boolean>('notificationVibration', true);

      for (const job of dueJobs) {
        await this.notificationService.showNotification(job.title, {
          body: job.body,
          tag: `rem-${job.entityId}`,
          data: { reminderId: job.entityId },
          soundEnabled: sound,
          vibrationEnabled: vibration
        });

        // Mark as sent in IndexedDB
        await this.jobRepo.markJobSent(job.id);
      }
    } catch (e) {
      console.error('Error processing notification jobs:', e);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get formatted next notification text for a reminder
   */
  async getNextNotificationText(reminder: Reminder): Promise<string | null> {
    if (reminder.status === 'completed' || reminder.status === 'dismissed') {
      return null;
    }

    const jobs = await this.jobRepo.getPendingJobsForEntity(reminder.id);
    if (!jobs || jobs.length === 0) return null;

    // Find earliest future job
    const sorted = jobs.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    const nextJob = sorted[0];
    if (!nextJob) return null;

    const alertDate = new Date(nextJob.scheduledTime);
    const now = new Date();

    const isToday = alertDate.toDateString() === now.toDateString();
    const timeStr = alertDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return `Today at ${timeStr}`;
    }

    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    if (alertDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeStr}`;
    }

    return `${alertDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
  }

  /**
   * Checks if a target datetime falls inside quiet hours
   */
  private isTimeInQuietHours(target: Date, startStr: string, endStr: string): boolean {
    const hours = target.getHours();
    const minutes = target.getMinutes();
    const currentMins = hours * 60 + minutes;

    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    // Overnight range (e.g. 22:00 -> 07:00)
    if (startTotal > endTotal) {
      return currentMins >= startTotal || currentMins < endTotal;
    } else {
      return currentMins >= startTotal && currentMins < endTotal;
    }
  }

  /**
   * Adjusts timestamp to the end of quiet hours
   */
  private postponeToQuietHoursEnd(target: Date, endStr: string): Date {
    const [endH, endM] = endStr.split(':').map(Number);
    const deferred = new Date(target);

    // If target was before midnight but during quiet hours, it defers to morning of next day
    if (target.getHours() >= 12) {
      deferred.setDate(deferred.getDate() + 1);
    }
    deferred.setHours(endH, endM, 0, 0);
    return deferred;
  }
}

