import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-200 backdrop-blur-sm"
      [class.hover:border-slate-300]="interactive()"
      [class.dark:hover:border-slate-700]="interactive()"
      [class.hover:shadow-md]="interactive()"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  interactive = input<boolean>(false);
}

