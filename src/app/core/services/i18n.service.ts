import { Injectable, signal, computed } from '@angular/core';
import { AppLanguage } from '../models/settings.model';

const STORAGE_KEY_LANG = 'reminder_app_language';
const STORAGE_KEY_NUMERALS = 'reminder_nepali_numerals';

const NEPALI_NUMERALS_MAP: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९'
};

export const TRANSLATIONS = {
  en: {
    // Brand & Navigation
    'app.name': 'REMINDER',
    'app.tagline': 'Offline-First Personal Assistant',
    'nav.dashboard': 'Dashboard',
    'nav.reminders': 'Reminders',
    'nav.calendar': 'Calendar',
    'nav.birthdays': 'Birthdays',
    'nav.events': 'Events',
    'nav.settings': 'Settings',

    // Common Actions
    'action.add': 'Add',
    'action.addReminder': 'Add Reminder',
    'action.create': 'Create',
    'action.save': 'Save',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.cancel': 'Cancel',
    'action.close': 'Close',
    'action.complete': 'Complete',
    'action.reopen': 'Reopen',
    'action.snooze': 'Snooze',
    'action.duplicate': 'Duplicate',
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.sync': 'Sync Now',
    'action.install': 'Install App',
    'action.enableAlerts': 'Enable Alerts',

    // Statuses
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'status.snoozed': 'Snoozed',
    'status.overdue': 'Overdue',
    'status.dueToday': 'Due Today',
    'status.synced': 'Synced',
    'status.syncing': 'Syncing...',
    'status.offline': 'Offline',
    'status.syncFailed': 'Sync Failed',
    'status.needsSync': 'Needs Sync',

    // Time Buckets
    'time.all': 'All',
    'time.today': 'Today',
    'time.tomorrow': 'Tomorrow',
    'time.thisWeek': 'This Week',
    'time.nextWeek': 'Next Week',
    'time.thisMonth': 'This Month',

    // Priorities
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.urgent': 'Urgent',

    // Dashboard & Stats
    'dash.title': 'Productivity Dashboard',
    'dash.statsThisWeek': 'This Week Overview',
    'dash.completionRate': 'Completion Rate',
    'dash.categoryBreakdown': 'Category Distribution',
    'dash.upcomingFestivals': 'Upcoming Festivals',
    'dash.activeBills': 'Bill Reminders',

    // Birthdays
    'bday.title': 'Birthdays & Anniversaries',
    'bday.add': 'Add Birthday / Anniversary',
    'bday.daysRemaining': 'days remaining',
    'bday.today': 'Today! 🎂',
    'bday.tomorrow': 'Tomorrow',
    'bday.turningAge': 'Turning',
    'bday.anniversaryMilestone': 'Anniversary',

    // Global Search
    'search.placeholder': 'Search reminders, events, birthdays, festivals...',
    'search.noResults': 'No results found matching your search.',
    'search.quickAction': 'Press Esc to close'
  },
  ne: {
    // Brand & Navigation
    'app.name': 'रिमाइन्डर',
    'app.tagline': 'अफलाइन-पहिलो व्यक्तिगत सहायक',
    'nav.dashboard': 'ड्यासबोर्ड',
    'nav.reminders': 'सम्झनाहरू',
    'nav.calendar': 'क्यालेन्डर',
    'nav.birthdays': 'जन्मदिन तथा वर्षगाँठ',
    'nav.events': 'कार्यक्रमहरू',
    'nav.settings': 'सेटिङहरू',

    // Common Actions
    'action.add': 'थप्नुहोस्',
    'action.addReminder': 'सम्झना थप्नुहोस्',
    'action.create': 'सिर्जना गर्नुहोस्',
    'action.save': 'सुरक्षित गर्नुहोस्',
    'action.edit': 'सम्पादन गर्नुहोस्',
    'action.delete': 'मेटाउनुहोस्',
    'action.cancel': 'रद्द गर्नुहोस्',
    'action.close': 'बन्द गर्नुहोस्',
    'action.complete': 'सम्पन्न गर्नुहोस्',
    'action.reopen': 'पुनः खोल्नुहोस्',
    'action.snooze': 'स्नुज गर्नुहोस्',
    'action.duplicate': 'प्रतिलिपि गर्नुहोस्',
    'action.search': 'खोज्नुहोस्',
    'action.filter': 'फिल्टर',
    'action.sync': 'सिङ्क गर्नुहोस्',
    'action.install': 'एप इन्स्टल गर्नुहोस्',
    'action.enableAlerts': 'सूचना सक्रिय गर्नुहोस्',

    // Statuses
    'status.pending': 'बाँकी',
    'status.completed': 'सम्पन्न',
    'status.snoozed': 'स्नुज गरिएको',
    'status.overdue': 'म्याद नाघेको',
    'status.dueToday': 'आजको कार्य',
    'status.synced': 'सिङ्क भयो',
    'status.syncing': 'सिङ्क हुँदैछ...',
    'status.offline': 'अफलाइन',
    'status.syncFailed': 'सिङ्क असफल',
    'status.needsSync': 'सिङ्क आवश्यक',

    // Time Buckets
    'time.all': 'सबै',
    'time.today': 'आज',
    'time.tomorrow': 'भोलि',
    'time.thisWeek': 'यो हप्ता',
    'time.nextWeek': 'अर्को हप्ता',
    'time.thisMonth': 'यो महिना',

    // Priorities
    'priority.low': 'सामान्य',
    'priority.medium': 'मध्यम',
    'priority.high': 'उच्च',
    'priority.urgent': 'अति जरुरी',

    // Dashboard & Stats
    'dash.title': 'उत्पादकता ड्यासबोर्ड',
    'dash.statsThisWeek': 'यस हप्ताको विवरण',
    'dash.completionRate': 'सम्पन्नता दर',
    'dash.categoryBreakdown': 'श्रेणीगत विवरण',
    'dash.upcomingFestivals': 'आगामी चाडपर्वहरू',
    'dash.activeBills': 'बिल भुक्तानी सम्झनाहरू',

    // Birthdays
    'bday.title': 'जन्मदिन तथा वर्षगाँठ',
    'bday.add': 'नयाँ थप्नुहोस्',
    'bday.daysRemaining': 'दिन बाँकी',
    'bday.today': 'आजै हो! 🎂',
    'bday.tomorrow': 'भोलि',
    'bday.turningAge': 'उमेर पुग्दै',
    'bday.anniversaryMilestone': 'वर्षगाँठ',

    // Global Search
    'search.placeholder': 'सम्झना, कार्यक्रम, जन्मदिन, चाडपर्व खोज्नुहोस्...',
    'search.noResults': 'कुनै नतिजा फेला परेन।',
    'search.quickAction': 'बन्द गर्न Esc थिच्नुहोस्'
  }
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS['en'];

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  readonly currentLang = signal<AppLanguage>(
    (localStorage.getItem(STORAGE_KEY_LANG) as AppLanguage) || 'en'
  );
  readonly nepaliNumeralsEnabled = signal<boolean>(
    localStorage.getItem(STORAGE_KEY_NUMERALS) === 'true'
  );

  setLanguage(lang: AppLanguage): void {
    this.currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  }

  setNepaliNumerals(enabled: boolean): void {
    this.nepaliNumeralsEnabled.set(enabled);
    localStorage.setItem(STORAGE_KEY_NUMERALS, String(enabled));
  }

  translate(key: string, defaultText?: string): string {
    const lang = this.currentLang();
    const dict = TRANSLATIONS[lang] as Record<string, string>;
    if (dict && dict[key]) {
      return dict[key];
    }
    const fallback = TRANSLATIONS.en as Record<string, string>;
    return fallback[key] || defaultText || key;
  }

  /**
   * Converts any ASCII numerals in a string/number to Devanagari numerals
   * Example: 2081-07-28 -> २०८१-०७-२८
   */
  formatNumerals(val: string | number): string {
    const str = String(val);
    if (!this.nepaliNumeralsEnabled() && this.currentLang() !== 'ne') {
      return str;
    }
    return str.replace(/[0-9]/g, match => NEPALI_NUMERALS_MAP[match] || match);
  }
}
