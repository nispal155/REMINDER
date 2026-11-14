import { Injectable } from '@angular/core';
import { BaseRepository } from './base.repository';
import { Habit } from '../../core/models/habit.model';
import { db } from '../db';

@Injectable({
  providedIn: 'root'
})
export class HabitRepository extends BaseRepository<Habit, string> {
  constructor() {
    super(db.habits);
  }

  async recordCompletion(habitId: string, dateAD: string): Promise<Habit | null> {
    const habit = await this.getById(habitId);
    if (!habit) return null;

    const completed = new Set(habit.completedDatesAD || []);
    if (!completed.has(dateAD)) {
      completed.add(dateAD);
      const sortedDates = Array.from(completed).sort();

      // Calculate streak
      let streak = 0;
      let curr = new Date(dateAD);
      while (true) {
        const iso = curr.toISOString().split('T')[0];
        if (completed.has(iso)) {
          streak++;
          curr.setDate(curr.getDate() - 1);
        } else {
          break;
        }
      }

      const bestStreak = Math.max(habit.bestStreak || 0, streak);
      const updated: Habit = {
        ...habit,
        streakCount: streak,
        bestStreak,
        completedDatesAD: sortedDates,
        updatedAt: new Date().toISOString()
      };

      await this.update(habitId, updated);
      return updated;
    }

    return habit;
  }
}
