import { Injectable, inject } from '@angular/core';
import { NepaliCalendarService } from './nepali-calendar.service';
import { Priority, RepeatType, ReminderCategory } from '../models/reminder.model';
import { BS_MONTHS } from '../models/calendar.model';

export interface ParsedQuickReminder {
  title: string;
  description?: string;
  dateAD: string; // YYYY-MM-DD
  dateBS: string; // YYYY-MM-DD
  time: string;   // HH:mm
  priority: Priority;
  category: ReminderCategory;
  tags: string[];
  amount?: number;
  currency?: string;
  repeatType: RepeatType;
}

@Injectable({
  providedIn: 'root'
})
export class NlpParserService {
  private readonly calendarService = inject(NepaliCalendarService);

  parse(input: string): ParsedQuickReminder {
    let text = input.trim();

    // 1. Extract Tags (@tag)
    const tagMatches = text.match(/@([a-zA-Z0-9_\-]+)/g) || [];
    const tags = tagMatches.map(t => t.toLowerCase());
    tags.forEach(t => {
      text = text.replace(t, '');
    });

    // 2. Extract Amount & Currency (e.g. Rs 1500, Rs. 1500, NPR 500, $50, रू 500)
    let amount: number | undefined;
    let currency: string | undefined;

    const amountRegex = /(?:rs\.?|npr|रू|\$)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)|([0-9]+(?:\.[0-9]+)?)\s*(?:rs\.?|npr|रू|rupees)/i;
    const amountMatch = text.match(amountRegex);
    if (amountMatch) {
      const valStr = (amountMatch[1] || amountMatch[2]).replace(/,/g, '');
      const parsedVal = parseFloat(valStr);
      if (!isNaN(parsedVal)) {
        amount = parsedVal;
        currency = text.includes('$') ? 'USD' : 'NPR';
      }
      text = text.replace(amountMatch[0], '');
    }

    // 3. Extract Priority
    let priority: Priority = 'medium';
    if (/\b(urgent|asap|critial)\b/i.test(text)) {
      priority = 'urgent';
      text = text.replace(/\b(urgent|asap|critical)\b/ig, '');
    } else if (/\b(high\s+priority|important)\b/i.test(text)) {
      priority = 'high';
      text = text.replace(/\b(high\s+priority|important)\b/ig, '');
    } else if (/\b(low\s+priority|someday)\b/i.test(text)) {
      priority = 'low';
      text = text.replace(/\b(low\s+priority|someday)\b/ig, '');
    }

    // 4. Extract Recurrence
    let repeatType: RepeatType = 'none';
    if (/\b(every\s+day|daily)\b/i.test(text)) {
      repeatType = 'daily';
      text = text.replace(/\b(every\s+day|daily)\b/ig, '');
    } else if (/\b(every\s+week|weekly|every\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i.test(text)) {
      repeatType = 'weekly';
      text = text.replace(/\b(every\s+week|weekly|every\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/ig, '');
    } else if (/\b(every\s+month|monthly)\b/i.test(text)) {
      repeatType = 'monthly';
      text = text.replace(/\b(every\s+month|monthly)\b/ig, '');
    } else if (/\b(every\s+year|yearly|annually)\b/i.test(text)) {
      repeatType = 'yearly_ad';
      text = text.replace(/\b(every\s+year|yearly|annually)\b/ig, '');
    }

    // 5. Extract Time
    let time = '09:00';
    const now = new Date();
    // Default time is 1 hour from now if later in the day
    const defaultHours = String((now.getHours() + 1) % 24).padStart(2, '0');
    time = `${defaultHours}:00`;

    // Time pattern: "at 5pm", "at 5:30pm", "17:00", "5:30 pm", "noon", "midnight"
    if (/\bnoon\b/i.test(text)) {
      time = '12:00';
      text = text.replace(/\bnoon\b/ig, '');
    } else if (/\bmidnight\b/i.test(text)) {
      time = '00:00';
      text = text.replace(/\bmidnight\b/ig, '');
    } else {
      const timeRegex = /(?:\bat\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
      const timeMatch = text.match(timeRegex);
      if (timeMatch && (timeMatch[3] || timeMatch[2] || text.includes('at ' + timeMatch[1]))) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
        const meridian = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

        if (meridian === 'pm' && hours < 12) hours += 12;
        if (meridian === 'am' && hours === 12) hours = 0;

        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          text = text.replace(timeMatch[0], '');
        }
      }
    }

    // 6. Extract Date (Gregorian or Bikram Sambat)
    let targetDate = new Date();

    // Check "in X days"
    const inDaysMatch = text.match(/\bin\s+(\d+)\s+days?\b/i);
    if (inDaysMatch) {
      const daysToAdd = parseInt(inDaysMatch[1], 10);
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      text = text.replace(inDaysMatch[0], '');
    } else if (/\btomorrow\b/i.test(text)) {
      targetDate.setDate(targetDate.getDate() + 1);
      text = text.replace(/\btomorrow\b/ig, '');
    } else if (/\bday\s+after\s+tomorrow\b/i.test(text)) {
      targetDate.setDate(targetDate.getDate() + 2);
      text = text.replace(/\bday\s+after\s+tomorrow\b/ig, '');
    } else if (/\btoday\b/i.test(text)) {
      text = text.replace(/\btoday\b/ig, '');
    } else if (/\btonight\b/i.test(text)) {
      time = '20:00';
      text = text.replace(/\btonight\b/ig, '');
    }

    // Check Nepali month date (e.g. "15 Kartik", "Kartik 15", "1 Baisakh")
    let detectedBsDate: { year: number; month: number; day: number } | null = null;
    for (let m = 0; m < BS_MONTHS.length; m++) {
      const monthMeta = BS_MONTHS[m];
      const monthNames = [monthMeta.nameEn.toLowerCase(), monthMeta.shortName.toLowerCase(), monthMeta.nameNp];
      for (const name of monthNames) {
        const regexDayMonth = new RegExp(`(\\d{1,2})(?:st|nd|rd|th)?\\s+${name}(?:\\s+(\\d{4}))?`, 'i');
        const regexMonthDay = new RegExp(`${name}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+(\\d{4}))?`, 'i');

        let match = text.match(regexDayMonth);
        let day = 0;
        let year = this.calendarService.adToBs(new Date()).year;
        if (match) {
          day = parseInt(match[1], 10);
          if (match[2]) year = parseInt(match[2], 10);
          text = text.replace(match[0], '');
        } else {
          match = text.match(regexMonthDay);
          if (match) {
            day = parseInt(match[1], 10);
            if (match[2]) year = parseInt(match[2], 10);
            text = text.replace(match[0], '');
          }
        }

        if (day > 0 && day <= 32) {
          detectedBsDate = { year, month: monthMeta.monthIndex, day };
          break;
        }
      }
      if (detectedBsDate) break;
    }

    let dateAD: string;
    let dateBS: string;

    if (detectedBsDate) {
      const jsDate = this.calendarService.bsToAd(detectedBsDate);
      dateAD = jsDate.toISOString().split('T')[0];
      dateBS = `${detectedBsDate.year}-${String(detectedBsDate.month).padStart(2, '0')}-${String(detectedBsDate.day).padStart(2, '0')}`;
    } else {
      dateAD = targetDate.toISOString().split('T')[0];
      const bs = this.calendarService.adToBs(dateAD);
      dateBS = `${bs.year}-${String(bs.month).padStart(2, '0')}-${String(bs.day).padStart(2, '0')}`;
    }

    // 7. Clean Title
    let cleanedTitle = text
      .replace(/\s+/g, ' ')
      .replace(/^(on|at|for|remind me to|remember to|to)\s+/i, '')
      .replace(/\s+(on|at|for)\s*$/i, '')
      .trim();

    if (!cleanedTitle) {
      cleanedTitle = 'Reminder';
    }

    // 8. Auto-detect Category
    const lowerTitle = (cleanedTitle + ' ' + tags.join(' ')).toLowerCase();
    let category: ReminderCategory = 'Personal';

    if (amount !== undefined || /\b(bill|electricity|water|internet|rent|loan|emi|fee|subscription|recharge)\b/i.test(lowerTitle)) {
      category = 'Bill';
    } else if (/\b(doctor|dentist|health|medicine|pill|hospital|workout|gym|clinic|exercise)\b/i.test(lowerTitle)) {
      category = 'Health';
    } else if (/\b(meeting|sync|standup|review|client|work|office|project|deadline|pr|ticket)\b/i.test(lowerTitle)) {
      category = 'Work';
    } else if (/\b(exam|study|homework|assignment|class|lecture|test|quiz|course)\b/i.test(lowerTitle)) {
      category = 'Study';
    } else if (/\b(birthday|bday|anniversary|party)\b/i.test(lowerTitle)) {
      category = 'Birthday';
    } else if (/\b(travel|flight|ticket|hotel|trip|vacation)\b/i.test(lowerTitle)) {
      category = 'Travel';
    }

    return {
      title: cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1),
      dateAD,
      dateBS,
      time,
      priority,
      category,
      tags,
      amount,
      currency,
      repeatType
    };
  }
}
