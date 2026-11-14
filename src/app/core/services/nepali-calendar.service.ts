import { Injectable } from '@angular/core';
import NepaliDate from 'nepali-date-converter';
import { BsDate, AdDate, BsMonthMeta, BS_MONTHS, AD_MONTHS, FestivalInfo } from '../models/calendar.model';
import { resolveFestival } from '../constants/nepali-festivals.constant';

@Injectable({
  providedIn: 'root'
})
export class NepaliCalendarService {
  readonly minBsYear = 2000;
  readonly maxBsYear = 2090;

  private getNDConstructor(): any {
    return (NepaliDate as any).default || NepaliDate;
  }

  /**
   * Get days in a specific BS month
   */
  getDaysInBsMonth(year: number, month: number): number {
    if (year < this.minBsYear || year > this.maxBsYear || month < 1 || month > 12) {
      return 30;
    }
    try {
      const ND = this.getNDConstructor();
      return new ND(year, month, 0).getDate();
    } catch {
      return 30;
    }
  }

  /**
   * Validate BS Date
   */
  validateBsDate(year: number, month: number, day: number): { valid: boolean; error?: string } {
    if (year < this.minBsYear || year > this.maxBsYear) {
      return { valid: false, error: `BS Year must be between ${this.minBsYear} and ${this.maxBsYear}` };
    }
    if (month < 1 || month > 12) {
      return { valid: false, error: 'BS Month must be between 1 and 12' };
    }
    const maxDays = this.getDaysInBsMonth(year, month);
    if (day < 1 || day > maxDays) {
      const monthName = BS_MONTHS[month - 1]?.nameEn || `Month ${month}`;
      return { valid: false, error: `${monthName} ${year} only has ${maxDays} days` };
    }
    return { valid: true };
  }

  /**
   * Convert Gregorian (AD) Date to Bikram Sambat (BS)
   */
  adToBs(dateInput: Date | string): BsDate {
    const ND = this.getNDConstructor();
    let jsDate: Date;

    if (typeof dateInput === 'string') {
      const parts = dateInput.split('-').map(Number);
      if (parts.length === 3) {
        jsDate = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
      } else {
        jsDate = new Date(dateInput);
      }
    } else {
      jsDate = new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate(), 12, 0, 0);
    }

    try {
      const nd = new ND(jsDate);
      return {
        year: nd.getYear(),
        month: nd.getMonth() + 1, // convert 0-indexed to 1-indexed
        day: nd.getDate()
      };
    } catch (e) {
      console.warn('Conversion AD to BS clamped:', e);
      return { year: 2081, month: 1, day: 1 };
    }
  }

  /**
   * Convert Bikram Sambat (BS) Date to Gregorian (AD)
   */
  bsToAd(bsInput: BsDate | string): Date {
    const ND = this.getNDConstructor();
    let y: number, m: number, d: number;

    if (typeof bsInput === 'string') {
      const parts = bsInput.split('-').map(Number);
      y = parts[0];
      m = parts[1];
      d = parts[2];
    } else {
      y = bsInput.year;
      m = bsInput.month;
      d = bsInput.day;
    }

    // Clamp
    if (y < this.minBsYear) y = this.minBsYear;
    if (y > this.maxBsYear) y = this.maxBsYear;
    if (m < 1) m = 1;
    if (m > 12) m = 12;

    const maxDays = this.getDaysInBsMonth(y, m);
    if (d > maxDays) d = maxDays;
    if (d < 1) d = 1;

    try {
      const nd = new ND(y, m - 1, d);
      const dateObj = nd.getDateObject();
      // Use exact year, month, date from AD object
      return new Date(dateObj.AD.year, dateObj.AD.month, dateObj.AD.date);
    } catch {
      return new Date();
    }
  }

  /**
   * Format BS date as YYYY-MM-DD
   */
  formatBsIso(bs: BsDate): string {
    const m = String(bs.month).padStart(2, '0');
    const d = String(bs.day).padStart(2, '0');
    return `${bs.year}-${m}-${d}`;
  }

  /**
   * Format AD Date as YYYY-MM-DD (local calendar date)
   */
  formatAdIso(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Format BS Date nicely (e.g. "28 Kartik 2081")
   */
  formatBsPretty(bs: BsDate): string {
    const meta = BS_MONTHS[bs.month - 1];
    const name = meta ? meta.nameEn : `Month ${bs.month}`;
    return `${bs.day} ${name} ${bs.year}`;
  }

  /**
   * Format AD Date nicely (e.g. "13 Nov 2024")
   */
  formatAdPretty(d: Date): string {
    const day = d.getDate();
    const month = AD_MONTHS[d.getMonth()]?.substring(0, 3);
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  }

  /**
   * Festival lookup (year-aware)
   */
  getFestival(bs: BsDate): FestivalInfo | undefined {
    return resolveFestival(bs.year, bs.month, bs.day) ?? undefined;
  }
}
