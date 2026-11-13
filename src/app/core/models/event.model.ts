import { NotificationSchedule, RepeatType } from './reminder.model';

export interface EventRecord {
  id: string;
  title: string;
  description?: string;
  startDateBS: string;
  startDateAD: string;
  endDateBS: string;
  endDateAD: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  repeatType: RepeatType;
  notificationSchedule: NotificationSchedule;
  createdAt: string;
  updatedAt: string;
}
