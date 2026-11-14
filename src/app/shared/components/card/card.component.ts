import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-white dark:bg-[#27465F] border border-[#D9E4EC] dark:border-[#365874] text-[#142536] dark:text-white rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-200 backdrop-blur-sm"
      [class.hover:border-[#1166B3]/50]="interactive()"
      [class.dark:hover:border-[#7DC0E5]/60]="interactive()"
      [class.hover:shadow-md]="interactive()"
    >
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {
  interactive = input<boolean>(false);
}
