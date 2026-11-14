import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { EventService } from './event.service';
import { NepaliCalendarService } from '../../core/services/nepali-calendar.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { EventRecord } from '../../core/models/event.model';
import { BS_MONTHS } from '../../core/models/calendar.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent, ModalComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Events & Meetings</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Multi-day events, meetings, and appointments with dual-calendar scheduling
          </p>
        </div>
        <app-button variant="primary" size="sm" (clicked)="openCreateModal()">
          + Add Event
        </app-button>
      </div>

      <!-- Events List -->
      @if (eventService.allEvents().length === 0) {
        <app-empty-state
          icon="📅"
          title="No events scheduled"
          description="Plan your meetings, trips, conferences, and multi-day events."
          actionLabel="+ Add First Event"
          (actionClicked)="openCreateModal()"
        />
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          @for (item of eventService.upcomingEvents(); track item.id) {
            <app-card [interactive]="true">
              <div class="flex items-start justify-between">
                <div class="space-y-1">
                  <h3 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{{ item.title }}</h3>
                  
                  <!-- Dates & Times -->
                  <div class="flex flex-wrap items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    <span>🇳🇵 {{ item.startDateBS }} @if (item.endDateBS !== item.startDateBS) { - {{ item.endDateBS }} }</span>
                    <span>•</span>
                    <span>🌐 {{ item.startDateAD }}</span>
                    @if (item.startTime) {
                      <span>•</span>
                      <span>⏰ {{ item.startTime }} - {{ item.endTime }}</span>
                    }
                  </div>

                  @if (item.location) {
                    <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 pt-1">
                      <span>📍</span>
                      <span>{{ item.location }}</span>
                    </p>
                  }

                  @if (item.description) {
                    <p class="text-xs text-slate-600 dark:text-slate-300 pt-1 line-clamp-2">
                      {{ item.description }}
                    </p>
                  }
                </div>

                <!-- Delete -->
                <button
                  type="button"
                  (click)="eventService.deleteEvent(item.id)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Delete event"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </app-card>
          }
        </div>
      }
    </div>

    <!-- Add Event Modal -->
    <app-modal
      [isOpen]="showModal()"
      title="Schedule Event"
      (close)="showModal.set(false)"
    >
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            formControlName="title"
            placeholder="e.g. Nepal Tech Summit, Team Offsite, Dentist Appointment"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Location / Meeting URL
          </label>
          <input
            type="text"
            formControlName="location"
            placeholder="e.g. Kathmandu, Zoom Link, Office Conference Room"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Start Date (AD) *
            </label>
            <input
              type="date"
              formControlName="startDateAD"
              (change)="syncDates()"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              End Date (AD)
            </label>
            <input
              type="date"
              formControlName="endDateAD"
              (change)="syncDates()"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Start Time
            </label>
            <input
              type="time"
              formControlName="startTime"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              End Time
            </label>
            <input
              type="time"
              formControlName="endTime"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description / Agenda Notes
          </label>
          <textarea
            formControlName="description"
            rows="2"
            placeholder="Agenda, prerequisites, links..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div class="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <app-button variant="ghost" size="sm" type="button" (clicked)="showModal.set(false)">
            Cancel
          </app-button>
          <app-button variant="primary" size="sm" type="submit" [disabled]="form.invalid">
            Schedule Event
          </app-button>
        </div>
      </form>
    </app-modal>
  `
})
export class EventsComponent implements OnInit {
  readonly eventService = inject(EventService);
  private readonly nepaliCalendar = inject(NepaliCalendarService);
  private readonly fb = inject(FormBuilder);

  readonly showModal = signal<boolean>(false);
  readonly startBsDisplay = signal<string>('');
  readonly endBsDisplay = signal<string>('');

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    location: [''],
    startDateAD: [new Date().toISOString().split('T')[0], Validators.required],
    endDateAD: [new Date().toISOString().split('T')[0]],
    startTime: ['09:00'],
    endTime: ['10:00'],
    description: ['']
  });

  ngOnInit() {
    this.syncDates();
  }

  openCreateModal() {
    this.showModal.set(true);
  }

  syncDates() {
    const sAd = this.form.get('startDateAD')?.value;
    const eAd = this.form.get('endDateAD')?.value || sAd;
    if (sAd) {
      this.startBsDisplay.set(this.nepaliCalendar.formatBsIso(this.nepaliCalendar.adToBs(sAd)));
    }
    if (eAd) {
      this.endBsDisplay.set(this.nepaliCalendar.formatBsIso(this.nepaliCalendar.adToBs(eAd)));
    }
  }

  async onSubmit() {
    if (this.form.invalid) return;
    const val = this.form.value;

    const sAd = val.startDateAD!;
    const eAd = val.endDateAD || sAd;
    const sBs = this.nepaliCalendar.formatBsIso(this.nepaliCalendar.adToBs(sAd));
    const eBs = this.nepaliCalendar.formatBsIso(this.nepaliCalendar.adToBs(eAd));

    await this.eventService.addEvent({
      title: val.title!,
      location: val.location || undefined,
      description: val.description || undefined,
      startDateAD: sAd,
      startDateBS: sBs,
      endDateAD: eAd,
      endDateBS: eBs,
      startTime: val.startTime || undefined,
      endTime: val.endTime || undefined
    });

    this.form.reset({
      title: '',
      location: '',
      startDateAD: new Date().toISOString().split('T')[0],
      endDateAD: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      description: ''
    });
    this.showModal.set(false);
  }
}

