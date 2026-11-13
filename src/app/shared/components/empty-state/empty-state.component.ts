import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div class="w-14 h-14 mb-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-2xl text-indigo-600 dark:text-indigo-400">
        {{ icon() }}
      </div>
      <h3 class="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
        {{ title() }}
      </h3>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
        {{ description() }}
      </p>
      @if (actionLabel()) {
        <app-button variant="primary" size="sm" (clicked)="actionClicked.emit()">
          {{ actionLabel() }}
        </app-button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  icon = input<string>('🔔');
  title = input<string>('No items yet');
  description = input<string>('You have no reminders or events scheduled at the moment.');
  actionLabel = input<string>('');
  actionClicked = output<void>();
}
