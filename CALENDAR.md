# Nepali Bikram Sambat (BS) Dual Calendar Guide

This document describes the Bikram Sambat (BS) ↔ Gregorian (AD) dual-calendar conversion engine, month day counts, festival database, and recurring rule calculations.

---

## 1. Calendar System Overview

Nepal uses the solar Bikram Sambat (BS) calendar as its official national calendar. BS is approximately 56.7 years ahead of the Gregorian (AD) calendar:
- Standard Month Structure: 12 months (Baisakh, Jestha, Ashadh, Shrawan, Bhadra, Ashwin, Kartik, Mangsir, Poush, Magh, Falgun, Chaitra).
- Variable Days per Month: Unlike Gregorian months, BS months vary between 29 and 32 days depending on the astrological transit of the sun.

---

## 2. Conversion Architecture (`NepaliCalendarService`)

The app isolates all calendar arithmetic behind `NepaliCalendarService` and `nepali-date-converter`:

### Conversion APIs
- `adToBs(dateAD: Date | string): NepaliDateObj`
- `bsToAd(dateBS: NepaliDateObj): Date`
- `formatBsIso(date: NepaliDateObj): string` (e.g. `2081-07-28`)
- `formatBsPretty(date: NepaliDateObj): string` (e.g. `28 Kartik 2081`)
- `getDaysInBsMonth(year: number, month: number): number`

All months are 1-indexed (`1-12`) in public interfaces and stored in IndexedDB.

---

## 3. Bikram Sambat Yearly Recurrence (`yearly_bs`)

Standard recurring reminders in Gregorian calendars simply add 365 or 366 days, causing Nepali dates to shift unpredictably.

REMINDER implements true **Bikram Sambat Yearly Recurrence**:
```typescript
// Example: Father's Birthday - 15 Bhadra
// When marked completed, next occurrence is calculated on:
const nextYear = prevBsDate.year + 1;
const month = prevBsDate.month; // 5 (Bhadra)
const day = prevBsDate.day;     // 15

// Validate against max days in target BS month
const maxDays = nepaliCalendar.getDaysInBsMonth(nextYear, month);
const validDay = Math.min(day, maxDays);

// Convert back to exact Gregorian AD datetime for background scheduling
const nextAdDate = nepaliCalendar.bsToAd({ year: nextYear, month, day: validDay });
```

---

## 4. Nepali Festivals Catalog (`FestivalService`)

Built-in support for official Nepalese national holidays and cultural festivals:

| Festival Name | Nepali Name | Month-Day (BS) | Public Holiday |
|---|---|---|---|
| Nepali New Year (Navavarsha) | नयाँ वर्ष | 1-1 (1 Baisakh) | Yes |
| Buddha Jayanti / Ubhauli | बुद्ध जयन्ती | 1-25 | Yes |
| Ganatantra Diwas (Republic Day) | गणतन्त्र दिवस | 2-15 | Yes |
| Janai Purnima / Raksha Bandhan | जनै पूर्णिमा | 5-1 | Yes |
| Haritalika Teej | हरितालिका तीज | 5-18 | Yes |
| Constitution Day (Sambidhan Diwas) | संविधान दिवस | 6-3 | Yes |
| Ghatasthapana (Dashain Begins) | घटस्थापना | 6-28 | Yes |
| Fulpati (Maha Saptami) | फूलपाती | 7-7 | Yes |
| Vijaya Dashami (Dashain Tika) | विजया दशमी | 7-10 | Yes |
| Laxmi Puja (Deepawali) | लक्ष्मी पूजा | 7-29 | Yes |
| Bhai Tika | भाइटीका | 8-1 | Yes |
| Chhath Parva | छठ पर्व | 8-6 | Yes |
| Maha Shivaratri | महाशिवरात्री | 11-17 | Yes |
| Fagu Purnima (Holi) | होली पर्व | 11-29 / 11-30 | Yes |
