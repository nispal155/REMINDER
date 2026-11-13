export type CalendarSystem = 'BS' | 'AD' | 'DUAL';
export type CalendarViewMode = 'month' | 'week' | 'day' | 'year';

export interface BsDate {
  year: number;
  month: number; // 1 - 12
  day: number;   // 1 - 32
}

export interface AdDate {
  year: number;
  month: number; // 1 - 12
  day: number;   // 1 - 31
}

export interface FestivalInfo {
  name: string;
  nameNepali?: string;
  isPublicHoliday?: boolean;
  description?: string;
}

export interface CalendarDayCell {
  dateAD: string; // YYYY-MM-DD
  dateBS: string; // YYYY-MM-DD
  bsDate: BsDate;
  adDate: AdDate;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  remindersCount: number;
  eventsCount: number;
  festival?: FestivalInfo;
}

export interface BsMonthMeta {
  monthIndex: number; // 1 - 12
  nameEn: string;
  nameNp: string;
  shortName: string;
}

export const BS_MONTHS: BsMonthMeta[] = [
  { monthIndex: 1, nameEn: 'Baisakh', nameNp: 'वैशाख', shortName: 'Bai' },
  { monthIndex: 2, nameEn: 'Jestha', nameNp: 'जेठ', shortName: 'Jes' },
  { monthIndex: 3, nameEn: 'Ashadh', nameNp: 'असार', shortName: 'Ash' },
  { monthIndex: 4, nameEn: 'Shrawan', nameNp: 'साउन', shortName: 'Shr' },
  { monthIndex: 5, nameEn: 'Bhadra', nameNp: 'भदौ', shortName: 'Bha' },
  { monthIndex: 6, nameEn: 'Ashwin', nameNp: 'असोज', shortName: 'Asw' },
  { monthIndex: 7, nameEn: 'Kartik', nameNp: 'कात्तिक', shortName: 'Kar' },
  { monthIndex: 8, nameEn: 'Mangsir', nameNp: 'मंसिर', shortName: 'Man' },
  { monthIndex: 9, nameEn: 'Poush', nameNp: 'पुस', shortName: 'Pou' },
  { monthIndex: 10, nameEn: 'Magh', nameNp: 'माघ', shortName: 'Mag' },
  { monthIndex: 11, nameEn: 'Falgun', nameNp: 'फागुन', shortName: 'Fal' },
  { monthIndex: 12, nameEn: 'Chaitra', nameNp: 'चैत', shortName: 'Cha' }
];

export const AD_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

