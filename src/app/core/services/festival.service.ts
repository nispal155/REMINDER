import { Injectable, inject } from '@angular/core';
import { FestivalInfo } from '../models/calendar.model';
import { NepaliCalendarService } from './nepali-calendar.service';

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

  private readonly festivalCatalog: Record<string, FestivalInfo> = {
    '1-1': { name: 'Nepali New Year (Navavarsha)', nameNepali: 'नयाँ वर्ष (२०८१/२०८२/२०८३)', isPublicHoliday: true },
    '1-11': { name: 'Loktantra Diwas (Democracy Day)', nameNepali: 'लोकतन्त्र दिवस', isPublicHoliday: true },
    '1-18': { name: 'International Labour Day', nameNepali: 'अन्तर्राष्ट्रिय मजदुर दिवस', isPublicHoliday: true },
    '1-25': { name: 'Buddha Jayanti / Ubhauli Parva', nameNepali: 'बुद्ध जयन्ती / उभौली पर्व', isPublicHoliday: true },
    '2-15': { name: 'Ganatantra Diwas (Republic Day)', nameNepali: 'गणतन्त्र दिवस', isPublicHoliday: true },
    '4-15': { name: 'Kheer Khane Din (Shrawan 15)', nameNepali: 'खीर खाने दिन', isPublicHoliday: false },
    '5-1': { name: 'Janai Purnima / Raksha Bandhan', nameNepali: 'जनै पूर्णिमा / रक्षाबन्धन', isPublicHoliday: true },
    '5-2': { name: 'Gai Jatra', nameNepali: 'गाईजात्रा', isPublicHoliday: true },
    '5-8': { name: 'Shree Krishna Janmashtami', nameNepali: 'श्रीकृष्ण जन्माष्टमी', isPublicHoliday: true },
    '5-18': { name: 'Haritalika Teej', nameNepali: 'हरितालिका तीज', isPublicHoliday: true },
    '5-20': { name: 'Rishi Panchami', nameNepali: 'ऋषि पञ्चमी', isPublicHoliday: false },
    '5-24': { name: 'Indra Jatra', nameNepali: 'इन्द्रजात्रा', isPublicHoliday: true },
    '6-3': { name: 'Constitution Day (Sambidhan Diwas)', nameNepali: 'संविधान दिवस', isPublicHoliday: true },
    '6-28': { name: 'Ghatasthapana (Dashain Begins)', nameNepali: 'घटस्थापना (दशैं प्रारम्भ)', isPublicHoliday: true },
    '7-7': { name: 'Maha Saptami (Fulpati)', nameNepali: 'फूलपाती', isPublicHoliday: true },
    '7-8': { name: 'Maha Ashtami', nameNepali: 'महाअष्टमी', isPublicHoliday: true },
    '7-9': { name: 'Maha Navami', nameNepali: 'महानवमी', isPublicHoliday: true },
    '7-10': { name: 'Vijaya Dashami (Tika)', nameNepali: 'विजया दशमी (दशैं टीका)', isPublicHoliday: true },
    '7-28': { name: 'Dhanteras', nameNepali: 'धनतेरस', isPublicHoliday: false },
    '7-29': { name: 'Laxmi Puja (Deepawali)', nameNepali: 'लक्ष्मी पूजा (दीपावली)', isPublicHoliday: true },
    '7-30': { name: 'Govardhan Puja / Mha Puja', nameNepali: 'गोवर्धन पूजा / म्ह पूजा', isPublicHoliday: true },
    '8-1': { name: 'Bhai Tika (Kija Puja)', nameNepali: 'भाइटीका', isPublicHoliday: true },
    '8-6': { name: 'Chhath Parva', nameNepali: 'छठ पर्व', isPublicHoliday: true },
    '9-15': { name: 'Tamu Lhosar', nameNepali: 'तमु ल्होसार', isPublicHoliday: true },
    '10-1': { name: 'Maghe Sankranti', nameNepali: 'माघे संक्रान्ति', isPublicHoliday: true },
    '10-16': { name: 'Martyrs Day (Sahid Diwas)', nameNepali: 'शहीद दिवस', isPublicHoliday: false },
    '10-18': { name: 'Sonam Lhosar', nameNepali: 'सोनाम ल्होसार', isPublicHoliday: true },
    '11-7': { name: 'National Democracy Day (Rashtriya Prajatantra Diwas)', nameNepali: 'राष्ट्रिय प्रजातन्त्र दिवस', isPublicHoliday: true },
    '11-17': { name: 'Maha Shivaratri', nameNepali: 'महाशिवरात्री', isPublicHoliday: true },
    '11-20': { name: 'Gyalpo Lhosar', nameNepali: 'ग्याल्पो ल्होसार', isPublicHoliday: true },
    '11-24': { name: 'International Women\'s Day', nameNepali: 'अन्तर्राष्ट्रिय महिला दिवस', isPublicHoliday: true },
    '11-29': { name: 'Fagu Purnima (Holi - Hilly Region)', nameNepali: 'फागु पूर्णिमा (होली)', isPublicHoliday: true },
    '11-30': { name: 'Fagu Purnima (Holi - Terai Region)', nameNepali: 'होली (तराई)', isPublicHoliday: true },
    '12-15': { name: 'Ghode Jatra', nameNepali: 'घोडे जात्रा', isPublicHoliday: true },
    '12-24': { name: 'Ram Navami / Chaite Dashain', nameNepali: 'रामनवमी / चैते दशैं', isPublicHoliday: true }
  };

  /**
   * Get festival for a given BS month and day
   */
  getFestival(month: number, day: number): FestivalInfo | null {
    return this.festivalCatalog[`${month}-${day}`] || null;
  }

  /**
   * Get all festivals in a specific BS month
   */
  getFestivalsForMonth(month: number): Array<{ day: number; festival: FestivalInfo }> {
    const list: Array<{ day: number; festival: FestivalInfo }> = [];
    for (let d = 1; d <= 32; d++) {
      const fest = this.getFestival(month, d);
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

    // Search the next 12 months in BS
    let currentYear = todayBs.year;
    let currentMonth = todayBs.month;
    let currentDay = todayBs.day;

    for (let mOffset = 0; mOffset < 12 && results.length < limit; mOffset++) {
      const targetMonth = ((currentMonth - 1 + mOffset) % 12) + 1;
      const targetYear = currentYear + Math.floor((currentMonth - 1 + mOffset) / 12);
      const maxDays = this.nepaliCalendar.getDaysInBsMonth(targetYear, targetMonth);

      const startDay = mOffset === 0 ? currentDay : 1;

      for (let d = startDay; d <= maxDays && results.length < limit; d++) {
        const fest = this.getFestival(targetMonth, d);
        if (fest) {
          const festBsDate = { year: targetYear, month: targetMonth, day: d };
          const festAdDate = this.nepaliCalendar.bsToAd(festBsDate);
          
          // Calculate days remaining
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
    for (const [key, info] of Object.entries(this.festivalCatalog)) {
      if (
        info.name.toLowerCase().includes(q) ||
        (info.nameNepali && info.nameNepali.includes(q))
      ) {
        matches.push({ dateKey: key, festival: info });
      }
    }
    return matches;
  }
}
