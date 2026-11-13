import { Injectable } from '@angular/core';
import NepaliDate from 'nepali-date-converter';
import { BsDate, AdDate, BsMonthMeta, BS_MONTHS, AD_MONTHS, FestivalInfo } from '../models/calendar.model';

@Injectable({
  providedIn: 'root'
})
export class NepaliCalendarService {
  readonly minBsYear = 2000;
  readonly maxBsYear = 2090;

  private readonly festivalDictionary: Record<string, FestivalInfo> = {
    '1-1': { name: 'Nepali New Year (Navavarsha)', nameNepali: 'नयाँ वर्ष', isPublicHoliday: true },
    '1-11': { name: 'Loktantra Diwas', nameNepali: 'लोकतन्त्र दिवस', isPublicHoliday: true },
    '1-18': { name: 'Labour Day', nameNepali: 'मजदुर दिवस', isPublicHoliday: true },
    '1-25': { name: 'Buddha Jayanti / Ubhauli', nameNepali: 'बुद्ध जयन्ती', isPublicHoliday: true },
    '2-15': { name: 'Ganatantra Diwas (Republic Day)', nameNepali: 'गणतन्त्र दिवस', isPublicHoliday: true },
    '4-15': { name: 'Kheer Khane Din', nameNepali: 'खीर खाने दिन', isPublicHoliday: false },
    '5-1': { name: 'Janai Purnima / Raksha Bandhan', nameNepali: 'जनै पूर्णिमा', isPublicHoliday: true },
    '5-2': { name: 'Gai Jatra', nameNepali: 'गाईजात्रा', isPublicHoliday: true },
    '5-8': { name: 'Krishna Janmashtami', nameNepali: 'कृष्ण जन्माष्टमी', isPublicHoliday: true },
    '5-18': { name: 'Haritalika Teej', nameNepali: 'हरितालिका तीज', isPublicHoliday: true },
    '5-20': { name: 'Rishi Panchami', nameNepali: 'ऋषि पञ्चमी', isPublicHoliday: false },
    '5-24': { name: 'Indra Jatra', nameNepali: 'इन्द्रजात्रा', isPublicHoliday: true },
    '6-3': { name: 'Constitution Day (Sambidhan Diwas)', nameNepali: 'संविधान दिवस', isPublicHoliday: true },
    '6-28': { name: 'Ghatasthapana (Dashain Begins)', nameNepali: 'घटस्थापना', isPublicHoliday: true },
    '7-7': { name: 'Maha Saptami (Fulpati)', nameNepali: 'फूलपाती', isPublicHoliday: true },
    '7-8': { name: 'Maha Ashtami', nameNepali: 'महाअष्टमी', isPublicHoliday: true },
    '7-9': { name: 'Maha Navami', nameNepali: 'महानवमी', isPublicHoliday: true },
    '7-10': { name: 'Vijaya Dashami (Tika)', nameNepali: 'विजया दशमी', isPublicHoliday: true },
    '7-28': { name: 'Dhanteras', nameNepali: 'धनतेरस', isPublicHoliday: false },
    '7-29': { name: 'Laxmi Puja (Deepawali)', nameNepali: 'लक्ष्मी पूजा', isPublicHoliday: true },
    '7-30': { name: 'Govardhan Puja / Mha Puja', nameNepali: 'गोवर्धन पूजा / म्ह पूजा', isPublicHoliday: true },
    '8-1': { name: 'Bhai Tika', nameNepali: 'भाइटीका', isPublicHoliday: true },
    '8-6': { name: 'Chhath Parva', nameNepali: 'छठ पर्व', isPublicHoliday: true },
    '9-15': { name: 'Tamu Lhosar', nameNepali: 'तमु ल्होसार', isPublicHoliday: true },
    '10-1': { name: 'Maghe Sankranti', nameNepali: 'माघे संक्रान्ति', isPublicHoliday: true },
    '10-16': { name: 'Martyrs Day (Sahid Diwas)', nameNepali: 'शहीद दिवस', isPublicHoliday: false },
    '10-18': { name: 'Sonam Lhosar', nameNepali: 'सोनाम ल्होसार', isPublicHoliday: true },
    '11-7': { name: 'Prajatantra Diwas (Democracy Day)', nameNepali: 'प्रजातन्त्र दिवस', isPublicHoliday: true },
    '11-17': { name: 'Maha Shivaratri', nameNepali: 'महाशिवरात्री', isPublicHoliday: true },
    '11-20': { name: 'Gyalpo Lhosar', nameNepali: 'ग्याल्पो ल्होसार', isPublicHoliday: true },
    '11-24': { name: 'International Women\'s Day', nameNepali: 'महिला दिवस', isPublicHoliday: true },
    '11-29': { name: 'Fagu Purnima (Holi - Hilly)', nameNepali: 'होली पर्व', isPublicHoliday: true },
    '11-30': { name: 'Fagu Purnima (Holi - Terai)', nameNepali: 'होली (तराई)', isPublicHoliday: true },
    '12-15': { name: 'Ghode Jatra', nameNepali: 'घोडे जात्रा', isPublicHoliday: true },
    '12-24': { name: 'Ram Navami / Chaite Dashain', nameNepali: 'राम नवमी / चैते दशैं', isPublicHoliday: true }
  };

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
   * Festival lookup
   */
  getFestival(bs: BsDate): FestivalInfo | undefined {
    const key = `${bs.month}-${bs.day}`;
    return this.festivalDictionary[key];
  }
}
