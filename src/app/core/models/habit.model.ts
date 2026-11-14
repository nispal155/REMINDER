export interface Habit {
  id: string;
  title: string;
  category?: string;
  streakCount: number;
  bestStreak: number;
  completedDatesAD: string[]; // List of YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

