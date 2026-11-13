import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { BirthdayService } from './birthday.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RelationshipType } from '../../core/models/birthday.model';

@Component({
  selector: 'app-birthdays',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, ButtonComponent, ModalComponent, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Birthdays & Anniversaries</h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Never miss a loved one's special day</p>
        </div>
        <app-button variant="primary" size="sm" (clicked)="openAddModal.set(true)">
          + Add Birthday
        </app-button>
      </div>

      <!-- List -->
      @if (birthdayService.birthdays().length === 0) {
        <app-empty-state
          icon="🎂"
          title="No birthdays saved"
          description="Keep track of friends and family birthdays with offline notifications."
          actionLabel="+ Add First Birthday"
          (actionClicked)="openAddModal.set(true)"
        />
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          @for (bday of birthdayService.birthdays(); track bday.id) {
            <app-card [interactive]="true">
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-2xl bg-pink-50 dark:bg-pink-950/70 border border-pink-200/60 dark:border-pink-800/60 flex items-center justify-center text-lg">
                    🎂
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white">{{ bday.name }}</h3>
                    <p class="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                      {{ bday.dateAD }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center space-x-1.5">
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {{ bday.relationship }}
                  </span>
                  <button
                    type="button"
                    (click)="birthdayService.deleteBirthday(bday.id)"
                    class="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              @if (bday.notes) {
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
                  {{ bday.notes }}
                </p>
              }
            </app-card>
          }
        </div>
      }
    </div>

    <!-- Add Birthday Modal -->
    <app-modal
      [isOpen]="openAddModal()"
      title="Add Birthday"
      (close)="openAddModal.set(false)"
    >
      <form [formGroup]="birthdayForm" (ngSubmit)="onSubmitBirthday()" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Person's Name *
          </label>
          <input
            type="text"
            formControlName="name"
            placeholder="e.g. Maya Shrestha"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date (AD) *
            </label>
            <input
              type="date"
              formControlName="dateAD"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Relationship
            </label>
            <select
              formControlName="relationship"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="family">Family</option>
              <option value="friend">Friend</option>
              <option value="colleague">Colleague</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Notes / Gift Ideas
          </label>
          <textarea
            formControlName="notes"
            rows="2"
            placeholder="Favorite cake, gift ideas, hobbies..."
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          ></textarea>
        </div>

        <div class="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <app-button variant="ghost" size="sm" type="button" (clicked)="openAddModal.set(false)">
            Cancel
          </app-button>
          <app-button variant="primary" size="sm" type="submit" [disabled]="birthdayForm.invalid">
            Save Birthday
          </app-button>
        </div>
      </form>
    </app-modal>
  `
})
export class BirthdaysComponent {
  readonly birthdayService = inject(BirthdayService);
  private readonly fb = inject(FormBuilder);
  readonly openAddModal = signal<boolean>(false);

  readonly birthdayForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    dateAD: [new Date().toISOString().split('T')[0], Validators.required],
    relationship: ['friend' as RelationshipType, Validators.required],
    notes: ['']
  });

  async onSubmitBirthday() {
    if (this.birthdayForm.invalid) return;
    const val = this.birthdayForm.value;

    await this.birthdayService.addBirthday({
      name: val.name!,
      dateAD: val.dateAD!,
      relationship: val.relationship as RelationshipType,
      notes: val.notes || undefined
    });

    this.birthdayForm.reset({
      name: '',
      dateAD: new Date().toISOString().split('T')[0],
      relationship: 'friend',
      notes: ''
    });
    this.openAddModal.set(false);
  }
}

