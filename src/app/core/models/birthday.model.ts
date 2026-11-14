export type RelationshipType = 'family' | 'friend' | 'colleague' | 'spouse' | 'partner' | 'other';
export type MilestoneType = 'birthday' | 'anniversary';

export interface BirthdayNotificationConfig {
  onDay: boolean;
  daysBefore: number[]; // e.g. [1, 3]
  time: string; // HH:mm
}

export interface Birthday {
  id: string;
  name: string;
  type: MilestoneType;
  dateBS: string; // YYYY-MM-DD
  dateAD: string; // YYYY-MM-DD
  calendarMode?: 'BS' | 'AD';
  relationship: RelationshipType;
  notes?: string;
  notificationSchedule: BirthdayNotificationConfig;
  createdAt: string;
  updatedAt: string;
}

export interface BirthdayWithCountdown extends Birthday {
  currentAge?: number;
  milestoneYears?: number;
  daysRemaining: number;
  isToday: boolean;
  isTomorrow: boolean;
  nextOccurrenceAD: string;
  nextOccurrenceBS: string;
}
