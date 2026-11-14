import { Injectable, inject } from '@angular/core';
import { db } from '../../database/db';
import { FestivalService } from './festival.service';

export interface GlobalSearchResult {
  id: string;
  type: 'reminder' | 'event' | 'birthday' | 'festival';
  title: string;
  subtitle: string;
  dateBS?: string;
  dateAD?: string;
  badge?: string;
  route: string;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private readonly festivalService = inject(FestivalService);

  async search(query: string): Promise<GlobalSearchResult[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: GlobalSearchResult[] = [];

    // 1. Search Reminders
    const reminders = await db.reminders.toArray();
    for (const r of reminders) {
      if (
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        r.category.toLowerCase().includes(q) ||
        r.dateBS.includes(q) ||
        r.dateAD.includes(q)
      ) {
        results.push({
          id: r.id,
          type: 'reminder',
          title: r.title,
          subtitle: `${r.category} • Due: ${r.dateBS} (${r.dateAD})`,
          dateBS: r.dateBS,
          dateAD: r.dateAD,
          badge: r.priority,
          route: '/reminders'
        });
      }
    }

    // 2. Search Events
    const events = await db.events.toArray();
    for (const e of events) {
      if (
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        e.startDateBS.includes(q) ||
        e.startDateAD.includes(q)
      ) {
        results.push({
          id: e.id,
          type: 'event',
          title: e.title,
          subtitle: `${e.location ? e.location + ' • ' : ''}${e.startDateBS} (${e.startDateAD})`,
          dateBS: e.startDateBS,
          dateAD: e.startDateAD,
          badge: 'Event',
          route: '/events'
        });
      }
    }

    // 3. Search Birthdays & Anniversaries
    const birthdays = await db.birthdays.toArray();
    for (const b of birthdays) {
      if (
        b.name.toLowerCase().includes(q) ||
        (b.notes && b.notes.toLowerCase().includes(q)) ||
        b.relationship.toLowerCase().includes(q) ||
        b.dateBS.includes(q) ||
        b.dateAD.includes(q)
      ) {
        results.push({
          id: b.id,
          type: 'birthday',
          title: b.name,
          subtitle: `${b.relationship} • ${b.dateBS} (${b.dateAD})`,
          dateBS: b.dateBS,
          dateAD: b.dateAD,
          badge: b.type === 'anniversary' ? 'Anniversary' : 'Birthday',
          route: '/birthdays'
        });
      }
    }

    // 4. Search Festivals
    const matchingFestivals = this.festivalService.searchFestivals(q);
    for (const item of matchingFestivals) {
      results.push({
        id: 'fest_' + item.dateKey,
        type: 'festival',
        title: item.festival.nameNepali ? `${item.festival.nameNepali} (${item.festival.name})` : item.festival.name,
        subtitle: `Nepali Festival • ${item.dateKey.replace('-', '/')} in BS`,
        badge: item.festival.isPublicHoliday ? 'Holiday' : 'Festival',
        route: '/calendar'
      });
    }

    return results;
  }
}
