import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReminderService, TemporalFilter, SortOption } from './reminder.service';
import { ReminderCardComponent } from './components/reminder-card/reminder-card.component';
import { ReminderFormComponent } from './components/reminder-form/reminder-form.component';
import { SnoozeModalComponent } from './components/snooze-modal/snooze-modal.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { Reminder, REMINDER_CATEGORIES, SnoozeDuration } from '../../core/models/reminder.model';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReminderCardComponent,
    ReminderFormComponent,
    SnoozeModalComponent,
    ModalComponent,
    ButtonComponent,
    EmptyStateComponent
  ],
  template: `
    <div class="space-y-6">
      
      <!-- Top Title & Quick Add Action -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Reminders</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Offline-first schedule with Nepali (BS) & English (AD) calendar support
          </p>
        </div>

        <app-button
          variant="primary"
          size="sm"
          (clicked)="openCreateModal()"
        >
          <span class="mr-1 text-base leading-none">+</span> Create Reminder
        </app-button>
      </div>

      <!-- Search & Filters Bar -->
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        
        <!-- Search Input -->
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            🔍
          </span>
          <input
            type="text"
            [ngModel]="reminderService.searchQuery()"
            (ngModelChange)="reminderService.searchQuery.set($event)"
            placeholder="Search reminders by title, category, notes, or date (e.g. 2081-07-28)..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          @if (reminderService.searchQuery()) {
            <button
              type="button"
              (click)="reminderService.searchQuery.set('')"
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          }
        </div>

        <!-- Temporal / Status Filter Tabs -->
        <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
          <button
            type="button"
            (click)="setTemporal('all')"
            [class.bg-indigo-600]="reminderService.selectedTemporal() === 'all' && reminderService.selectedStatus() === 'all'"
            [class.text-white]="reminderService.selectedTemporal() === 'all' && reminderService.selectedStatus() === 'all'"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer"
          >
            All ({{ reminderService.allReminders().length }})
          </button>

          <button
            type="button"
            (click)="setTemporal('today')"
            [class.bg-indigo-600]="reminderService.selectedTemporal() === 'today'"
            [class.text-white]="reminderService.selectedTemporal() === 'today'"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer"
          >
            📅 Today ({{ reminderService.dueToday().length }})
          </button>

          <button
            type="button"
            (click)="setTemporal('tomorrow')"
            [class.bg-indigo-600]="reminderService.selectedTemporal() === 'tomorrow'"
            [class.text-white]="reminderService.selectedTemporal() === 'tomorrow'"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer"
          >
            Tomorrow
          </button>

          <button
            type="button"
            (click)="setTemporal('thisWeek')"
            [class.bg-indigo-600]="reminderService.selectedTemporal() === 'thisWeek'"
            [class.text-white]="reminderService.selectedTemporal() === 'thisWeek'"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer"
          >
            This Week
          </button>

          <button
            type="button"
            (click)="setTemporal('nextWeek')"
            [class.bg-indigo-600]="reminderService.selectedTemporal() === 'nextWeek'"
            [class.text-white]="reminderService.selectedTemporal() === 'nextWeek'"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer"
          >
            Next Week
          </button>

          <button
            type="button"
            (click)="setStatus('completed')"
            [class.bg-emerald-600]="reminderService.selectedStatus() === 'completed'"
            [class.text-white]="reminderService.selectedStatus() === 'completed'"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer"
          >
            ✓ Completed ({{ reminderService.completed().length }})
          </button>

          <button
            type="button"
            (click)="setStatus('snoozed')"
            [class.bg-amber-600]="reminderService.selectedStatus() === 'snoozed'"
            [class.text-white]="reminderService.selectedStatus() === 'snoozed'"
            class="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shrink-0 cursor-pointer"
          >
            💤 Snoozed
          </button>
        </div>

        <!-- Filter Dropdowns (Category, Priority, Sort) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <!-- Category -->
          <div class="flex items-center space-x-2">
            <span class="text-slate-500 shrink-0">Category:</span>
            <select
              [ngModel]="reminderService.selectedCategory()"
              (ngModelChange)="reminderService.selectedCategory.set($event)"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <!-- Priority -->
          <div class="flex items-center space-x-2">
            <span class="text-slate-500 shrink-0">Priority:</span>
            <select
              [ngModel]="reminderService.selectedPriority()"
              (ngModelChange)="reminderService.selectedPriority.set($event)"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <!-- Sort -->
          <div class="flex items-center space-x-2">
            <span class="text-slate-500 shrink-0">Sort by:</span>
            <select
              [ngModel]="reminderService.selectedSort()"
              (ngModelChange)="reminderService.selectedSort.set($event)"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="date_asc">Date (Earliest First)</option>
              <option value="date_desc">Date (Latest First)</option>
              <option value="priority">Priority (Highest First)</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="created_desc">Recently Created</option>
            </select>
          </div>
        </div>

      </div>

      <!-- Reminder Cards List -->
      @if (reminderService.filteredReminders().length === 0) {
        <app-empty-state
          icon="📋"
          title="No reminders match your criteria"
          description="Try broadening your search term or filter options, or create a new reminder."
          actionLabel="+ Create Reminder"
          (actionClicked)="openCreateModal()"
        />
      } @else {
        <div class="space-y-3">
          @for (reminder of reminderService.filteredReminders(); track reminder.id) {
            <app-reminder-card
              [reminder]="reminder"
              (completedToggled)="reminderService.toggleComplete($event)"
              (subtaskToggled)="reminderService.toggleSubtask($event.reminder.id, $event.subtaskId)"
              (paidToggled)="reminderService.togglePaid($event.id)"
              (snoozeClicked)="openSnoozeModal($event)"
              (editClicked)="openEditModal($event)"
              (duplicateClicked)="reminderService.duplicateReminder($event)"
              (deleteClicked)="reminderService.deleteReminder($event.id)"
            />
          }
        </div>
      }

    </div>

    <!-- Create/Edit Reminder Modal -->
    <app-modal
      [isOpen]="showFormModal()"
      [title]="editingReminder() ? 'Edit Reminder' : 'Create Reminder'"
      (close)="closeFormModal()"
    >
      <app-reminder-form
        [initialReminder]="editingReminder()"
        (saved)="onSaveReminder($event)"
        (cancelled)="closeFormModal()"
      />
    </app-modal>

    <!-- Snooze Modal -->
    <app-snooze-modal
      [isOpen]="showSnoozeModal()"
      [reminder]="snoozingReminder()"
      (snoozed)="onApplySnooze($event)"
      (cancelled)="showSnoozeModal.set(false)"
    />
  `
})
export class RemindersComponent {
  readonly reminderService = inject(ReminderService);
  readonly categories = REMINDER_CATEGORIES;

  readonly showFormModal = signal<boolean>(false);
  readonly editingReminder = signal<Reminder | null>(null);

  readonly showSnoozeModal = signal<boolean>(false);
  readonly snoozingReminder = signal<Reminder | null>(null);

  setTemporal(temp: TemporalFilter) {
    this.reminderService.selectedStatus.set('all');
    this.reminderService.selectedTemporal.set(temp);
  }

  setStatus(status: string) {
    this.reminderService.selectedTemporal.set('all');
    this.reminderService.selectedStatus.set(status);
  }

  openCreateModal() {
    this.editingReminder.set(null);
    this.showFormModal.set(true);
  }

  openEditModal(reminder: Reminder) {
    this.editingReminder.set(reminder);
    this.showFormModal.set(true);
  }

  closeFormModal() {
    this.showFormModal.set(false);
    this.editingReminder.set(null);
  }

  async onSaveReminder(data: any) {
    const existing = this.editingReminder();
    if (existing) {
      await this.reminderService.updateReminder(existing.id, data);
    } else {
      await this.reminderService.addReminder(data);
    }
    this.closeFormModal();
  }

  openSnoozeModal(reminder: Reminder) {
    this.snoozingReminder.set(reminder);
    this.showSnoozeModal.set(true);
  }

  async onApplySnooze(event: { duration: SnoozeDuration; customIsoTime?: string }) {
    const rem = this.snoozingReminder();
    if (rem) {
      await this.reminderService.snoozeReminder(rem, event.duration, event.customIsoTime);
    }
    this.showSnoozeModal.set(false);
    this.snoozingReminder.set(null);
  }
}
