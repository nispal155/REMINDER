import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      (click)="clicked.emit($event)"
      [class]="getButtonClasses()"
    >
      @if (loading()) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('md');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);

  clicked = output<MouseEvent>();

  getButtonClasses(): string {
    const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base'
    };

    // ASTRA Brand Guidelines Color System: Astra Blue #1166B3, Slate Blue #27465F, Ice Cyan #ABDAF0
    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-[#1166B3] hover:bg-[#0E5291] text-white shadow-sm shadow-[#1166B3]/25 focus:ring-[#7DC0E5] dark:focus:ring-offset-[#1B2E40]',
      secondary: 'bg-[#E9F0F6] hover:bg-[#D9E4EC] text-[#142536] dark:bg-[#27465F] dark:hover:bg-[#1F384F] dark:text-[#FFFFFF] border border-[#D9E4EC] dark:border-[#365874] focus:ring-[#1166B3]',
      outline: 'border border-[#1166B3] text-[#1166B3] hover:bg-[#1166B3]/10 dark:text-[#ABDAF0] dark:border-[#ABDAF0]/60 dark:hover:bg-[#ABDAF0]/10 focus:ring-[#7DC0E5]',
      ghost: 'text-[#142536] dark:text-[#FFFFFF] hover:bg-[#E9F0F6]/80 dark:hover:bg-[#27465F]/70 focus:ring-[#1166B3]',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 focus:ring-rose-500'
    };

    const width = this.fullWidth() ? 'w-full' : '';

    return `${base} ${sizes[this.size()]} ${variants[this.variant()]} ${width}`;
  }
}
