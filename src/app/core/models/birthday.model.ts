export type RelationshipType = 'family' | 'friend' | 'colleague' | 'other';

export interface BirthdayNotificationConfig {
  onDay: boolean;
  daysBefore: number[]; // e.g. [1, 3]
  time: string; // HH:mm
}

export interface Birthday {
  id: string;
  name: string;
  dateBS: string; // YYYY-MM-DD
  dateAD: string; // YYYY-MM-DD
  relationship: RelationshipType;
  notes?: string;
  notificationSchedule: BirthdayNotificationConfig;
  createdAt: string;
  updatedAt: string;
}
