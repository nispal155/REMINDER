import { Injectable, inject, signal, computed } from '@angular/core';
import { NepaliCalendarService } from './nepali-calendar.service';
import { TithiService } from './tithi.service';
import {
  CalendarSystem,
  CalendarViewMode,
  CalendarDayCell,
  BsDate,
  BS_MONTHS,
  AD_MONTHS
} from '../models/calendar.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private readonly nepaliCalendar = inject(NepaliCalendarService);
  private readonly tithiService = inject(TithiService);

  readonly calendarSystem = signal<CalendarSystem>('DUAL');
  readonly viewMode = signal<CalendarViewMode>('month');
  readonly showHolidaysOnly = signal<boolean>(false);

  // Currently focused anchor date (JavaScript Date)
  readonly activeDate = signal<Date>(new Date());
  readonly selectedCell = signal<CalendarDayCell | null>(null);

  // Active BS Date computed from activeDate
  readonly activeBsDate = computed<BsDate>(() => {
    return this.nepaliCalendar.adToBs(this.activeDate());
  });

  // Current Month Title (AD, BS, or Dual)
  readonly headerTitle = computed<string>(() => {
    const sys = this.calendarSystem();
    const ad = this.activeDate();
    const bs = this.activeBsDate();

    const adMonthName = AD_MONTHS[ad.getMonth()];
    const adYear = ad.getFullYear();
    const bsMonthName = BS_MONTHS[bs.month - 1]?.nameEn || `Month ${bs.month}`;
    const bsYear = bs.year;

    if (sys === 'BS') {
      return `${bsMonthName} ${bsYear}`;
    }
    if (sys === 'AD') {
      return `${adMonthName} ${adYear}`;
    }
    // Dual
    return `${bsMonthName} ${bsYear} (${adMonthName} ${adYear})`;
  });

  /**
   * Generates calendar grid cells for the active month
   */
  readonly monthGrid = computed<CalendarDayCell[]>(() => {
    const sys = this.calendarSystem();
    const todayAdIso = this.nepaliCalendar.formatAdIso(new Date());

    if (sys === 'BS' || sys === 'DUAL') {
      return this.generateBsMonthGrid(todayAdIso);
    } else {
      return this.generateAdMonthGrid(todayAdIso);
    }
  });

  private generateBsMonthGrid(todayAdIso: string): CalendarDayCell[] {
    const activeBs = this.activeBsDate();
    const year = activeBs.year;
    const month = activeBs.month;
    const daysInMonth = this.nepaliCalendar.getDaysInBsMonth(year, month);

    // Get the day of the week for Baisakh/first day of this BS month
    const firstDayAd = this.nepaliCalendar.bsToAd({ year, month, day: 1 });
    const startDayOfWeek = firstDayAd.getDay(); // 0 = Sun, 6 = Sat

    const cells: CalendarDayCell[] = [];

    // Previous month leading days
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const daysInPrevMonth = this.nepaliCalendar.getDaysInBsMonth(prevYear, prevMonth);

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const bsDate: BsDate = { year: prevYear, month: prevMonth, day };
      const adDateObj = this.nepaliCalendar.bsToAd(bsDate);
      const dateAD = this.nepaliCalendar.formatAdIso(adDateObj);
      const dateBS = this.nepaliCalendar.formatBsIso(bsDate);
      const lunar = this.tithiService.getLunarInfo(dateAD, bsDate.day);
      const festival = this.nepaliCalendar.getFestival(bsDate);

      cells.push({
        dateAD,
        dateBS,
        bsDate,
        adDate: { year: adDateObj.getFullYear(), month: adDateObj.getMonth() + 1, day: adDateObj.getDate() },
        dayOfWeek: adDateObj.getDay(),
        isCurrentMonth: false,
        isToday: dateAD === todayAdIso,
        isSelected: false,
        remindersCount: 0,
        eventsCount: 0,
        festival,
        tithi: lunar.badgeLabelNp || lunar.tithiNameNp,
        isGazettedHoliday: festival?.isPublicHoliday || false
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const bsDate: BsDate = { year, month, day };
      const adDateObj = this.nepaliCalendar.bsToAd(bsDate);
      const dateAD = this.nepaliCalendar.formatAdIso(adDateObj);
      const dateBS = this.nepaliCalendar.formatBsIso(bsDate);
      const lunar = this.tithiService.getLunarInfo(dateAD, bsDate.day);
      const festival = this.nepaliCalendar.getFestival(bsDate);

      cells.push({
        dateAD,
        dateBS,
        bsDate,
        adDate: { year: adDateObj.getFullYear(), month: adDateObj.getMonth() + 1, day: adDateObj.getDate() },
        dayOfWeek: adDateObj.getDay(),
        isCurrentMonth: true,
        isToday: dateAD === todayAdIso,
        isSelected: false,
        remindersCount: 0,
        eventsCount: 0,
        festival,
        tithi: lunar.badgeLabelNp || lunar.tithiNameNp,
        isGazettedHoliday: festival?.isPublicHoliday || false
      });
    }

    // Trailing days to fill standard 35 or 42 grid cells
    const remaining = (7 - (cells.length % 7)) % 7;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    for (let day = 1; day <= remaining; day++) {
      const bsDate: BsDate = { year: nextYear, month: nextMonth, day };
      const adDateObj = this.nepaliCalendar.bsToAd(bsDate);
      const dateAD = this.nepaliCalendar.formatAdIso(adDateObj);
      const dateBS = this.nepaliCalendar.formatBsIso(bsDate);
      const lunar = this.tithiService.getLunarInfo(dateAD, bsDate.day);
      const festival = this.nepaliCalendar.getFestival(bsDate);

      cells.push({
        dateAD,
        dateBS,
        bsDate,
        adDate: { year: adDateObj.getFullYear(), month: adDateObj.getMonth() + 1, day: adDateObj.getDate() },
        dayOfWeek: adDateObj.getDay(),
        isCurrentMonth: false,
        isToday: dateAD === todayAdIso,
        isSelected: false,
        remindersCount: 0,
        eventsCount: 0,
        festival,
        tithi: lunar.badgeLabelNp || lunar.tithiNameNp,
        isGazettedHoliday: festival?.isPublicHoliday || false
      });
    }

    return cells;
  }

  private generateAdMonthGrid(todayAdIso: string): CalendarDayCell[] {
    const active = this.activeDate();
    const year = active.getFullYear();
    const month = active.getMonth(); // 0-indexed

    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();

    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const cells: CalendarDayCell[] = [];

    // Leading days from previous AD month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const adDateObj = new Date(year, month - 1, day);
      const dateAD = this.nepaliCalendar.formatAdIso(adDateObj);
      const bsDate = this.nepaliCalendar.adToBs(dateAD);
      const dateBS = this.nepaliCalendar.formatBsIso(bsDate);
      const lunar = this.tithiService.getLunarInfo(dateAD, bsDate.day);
      const festival = this.nepaliCalendar.getFestival(bsDate);

      cells.push({
        dateAD,
        dateBS,
        bsDate,
        adDate: { year: adDateObj.getFullYear(), month: adDateObj.getMonth() + 1, day: adDateObj.getDate() },
        dayOfWeek: adDateObj.getDay(),
        isCurrentMonth: false,
        isToday: dateAD === todayAdIso,
        isSelected: false,
        remindersCount: 0,
        eventsCount: 0,
        festival,
        tithi: lunar.badgeLabelNp || lunar.tithiNameNp,
        isGazettedHoliday: festival?.isPublicHoliday || false
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const adDateObj = new Date(year, month, day);
      const dateAD = this.nepaliCalendar.formatAdIso(adDateObj);
      const bsDate = this.nepaliCalendar.adToBs(dateAD);
      const dateBS = this.nepaliCalendar.formatBsIso(bsDate);
      const lunar = this.tithiService.getLunarInfo(dateAD, bsDate.day);
      const festival = this.nepaliCalendar.getFestival(bsDate);

      cells.push({
        dateAD,
        dateBS,
        bsDate,
        adDate: { year: adDateObj.getFullYear(), month: adDateObj.getMonth() + 1, day: adDateObj.getDate() },
        dayOfWeek: adDateObj.getDay(),
        isCurrentMonth: true,
        isToday: dateAD === todayAdIso,
        isSelected: false,
        remindersCount: 0,
        eventsCount: 0,
        festival,
        tithi: lunar.badgeLabelNp || lunar.tithiNameNp,
        isGazettedHoliday: festival?.isPublicHoliday || false
      });
    }

    // Trailing days
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let day = 1; day <= remaining; day++) {
      const adDateObj = new Date(year, month + 1, day);
      const dateAD = this.nepaliCalendar.formatAdIso(adDateObj);
      const bsDate = this.nepaliCalendar.adToBs(dateAD);
      const dateBS = this.nepaliCalendar.formatBsIso(bsDate);
      const lunar = this.tithiService.getLunarInfo(dateAD, bsDate.day);
      const festival = this.nepaliCalendar.getFestival(bsDate);

      cells.push({
        dateAD,
        dateBS,
        bsDate,
        adDate: { year: adDateObj.getFullYear(), month: adDateObj.getMonth() + 1, day: adDateObj.getDate() },
        dayOfWeek: adDateObj.getDay(),
        isCurrentMonth: false,
        isToday: dateAD === todayAdIso,
        isSelected: false,
        remindersCount: 0,
        eventsCount: 0,
        festival,
        tithi: lunar.badgeLabelNp || lunar.tithiNameNp,
        isGazettedHoliday: festival?.isPublicHoliday || false
      });
    }

    return cells;
  }

  // Navigation handlers
  nextMonth(): void {
    const sys = this.calendarSystem();
    if (sys === 'BS' || sys === 'DUAL') {
      const bs = this.activeBsDate();
      let nextMonth = bs.month + 1;
      let nextYear = bs.year;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear++;
      }
      const newAd = this.nepaliCalendar.bsToAd({ year: nextYear, month: nextMonth, day: 1 });
      this.activeDate.set(newAd);
    } else {
      const cur = this.activeDate();
      this.activeDate.set(new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
    }
  }

  prevMonth(): void {
    const sys = this.calendarSystem();
    if (sys === 'BS' || sys === 'DUAL') {
      const bs = this.activeBsDate();
      let prevMonth = bs.month - 1;
      let prevYear = bs.year;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear--;
      }
      const newAd = this.nepaliCalendar.bsToAd({ year: prevYear, month: prevMonth, day: 1 });
      this.activeDate.set(newAd);
    } else {
      const cur = this.activeDate();
      this.activeDate.set(new Date(cur.getFullYear(), cur.getMonth() - 1, 1));
    }
  }

  nextYear(): void {
    const sys = this.calendarSystem();
    if (sys === 'BS' || sys === 'DUAL') {
      const bs = this.activeBsDate();
      const newAd = this.nepaliCalendar.bsToAd({ year: bs.year + 1, month: bs.month, day: 1 });
      this.activeDate.set(newAd);
    } else {
      const cur = this.activeDate();
      this.activeDate.set(new Date(cur.getFullYear() + 1, cur.getMonth(), 1));
    }
  }

  prevYear(): void {
    const sys = this.calendarSystem();
    if (sys === 'BS' || sys === 'DUAL') {
      const bs = this.activeBsDate();
      const newAd = this.nepaliCalendar.bsToAd({ year: bs.year - 1, month: bs.month, day: 1 });
      this.activeDate.set(newAd);
    } else {
      const cur = this.activeDate();
      this.activeDate.set(new Date(cur.getFullYear() - 1, cur.getMonth(), 1));
    }
  }

  goToToday(): void {
    this.activeDate.set(new Date());
  }

  setSystem(system: CalendarSystem): void {
    this.calendarSystem.set(system);
  }

  setViewMode(mode: CalendarViewMode): void {
    this.viewMode.set(mode);
  }

  selectDate(cell: CalendarDayCell): void {
    this.selectedCell.set(cell);
  }
}

