import { Injectable, inject } from '@angular/core';
import { FestivalInfo } from '../models/calendar.model';
import { NepaliCalendarService } from './nepali-calendar.service';
import {
  SOLAR_FIXED_FESTIVALS,
  YEARLY_LUNAR_FESTIVALS,
  resolveFestival
} from '../constants/nepali-festivals.constant';

export interface UpcomingFestivalItem {
  dateBS: string;
  festival: FestivalInfo;
  daysRemaining: number;
}

@Injectable({
  providedIn: 'root'
})
export class FestivalService {
  private readonly nepaliCalendar = inject(NepaliCalendarService);

  /**
   * Get festival for a given BS date.
   * Supports both 3-arg (year, month, day) and 2-arg (month, day) with current year fallback.
   */
  getFestival(yearOrMonth: number, monthOrDay: number, day?: number): FestivalInfo | null {
    if (day !== undefined) {
      // Called as getFestival(year, month, day)
      return resolveFestival(yearOrMonth, monthOrDay, day);
    }

    // Called as getFestival(month, day) -> default to current active BS year
    const todayAd = new Date();
    const todayBs = this.nepaliCalendar.adToBs(todayAd);
    return resolveFestival(todayBs.year, yearOrMonth, monthOrDay);
  }

  /**
   * Get all festivals in a specific BS month (for given year, defaults to current BS year)
   */
  getFestivalsForMonth(month: number, year?: number): Array<{ day: number; festival: FestivalInfo }> {
    const targetYear = year ?? this.nepaliCalendar.adToBs(new Date()).year;
    const list: Array<{ day: number; festival: FestivalInfo }> = [];
    const maxDays = this.nepaliCalendar.getDaysInBsMonth(targetYear, month);

    for (let d = 1; d <= maxDays; d++) {
      const fest = resolveFestival(targetYear, month, d);
      if (fest) {
        list.push({ day: d, festival: fest });
      }
    }
    return list;
  }

  /**
   * Get upcoming festivals chronologically starting from today's BS date
   */
  getUpcomingFestivals(limit = 5): UpcomingFestivalItem[] {
    const todayAd = new Date();
    const todayBs = this.nepaliCalendar.adToBs(todayAd);
    const results: UpcomingFestivalItem[] = [];

    let currentYear = todayBs.year;
    let currentMonth = todayBs.month;
    let currentDay = todayBs.day;

    for (let mOffset = 0; mOffset < 12 && results.length < limit; mOffset++) {
      const targetMonth = ((currentMonth - 1 + mOffset) % 12) + 1;
      const targetYear = currentYear + Math.floor((currentMonth - 1 + mOffset) / 12);
      const maxDays = this.nepaliCalendar.getDaysInBsMonth(targetYear, targetMonth);

      const startDay = mOffset === 0 ? currentDay : 1;

      for (let d = startDay; d <= maxDays && results.length < limit; d++) {
        const fest = resolveFestival(targetYear, targetMonth, d);
        if (fest) {
          const festBsDate = { year: targetYear, month: targetMonth, day: d };
          const festAdDate = this.nepaliCalendar.bsToAd(festBsDate);

          const diffMs = festAdDate.getTime() - todayAd.getTime();
          const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

          results.push({
            dateBS: `${festBsDate.year}-${String(festBsDate.month).padStart(2, '0')}-${String(festBsDate.day).padStart(2, '0')}`,
            festival: fest,
            daysRemaining
          });
        }
      }
    }

    return results;
  }

  /**
   * Search festivals across English and Nepali names
   */
  searchFestivals(query: string): Array<{ dateKey: string; festival: FestivalInfo }> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const matches: Array<{ dateKey: string; festival: FestivalInfo }> = [];
    const seenNames = new Set<string>();

    // 1. Search lunar yearly festivals
    for (const [key, info] of Object.entries(YEARLY_LUNAR_FESTIVALS)) {
      if (
        info.name.toLowerCase().includes(q) ||
        (info.nameNepali && info.nameNepali.includes(q))
      ) {
        if (!seenNames.has(info.name)) {
          seenNames.add(info.name);
          matches.push({ dateKey: key, festival: info });
        }
      }
    }

    // 2. Search solar fixed festivals
    for (const [key, info] of Object.entries(SOLAR_FIXED_FESTIVALS)) {
      if (
        info.name.toLowerCase().includes(q) ||
        (info.nameNepali && info.nameNepali.includes(q))
      ) {
        if (!seenNames.has(info.name)) {
          seenNames.add(info.name);
          matches.push({ dateKey: key, festival: info });
        }
      }
    }

    return matches;
  }
}
