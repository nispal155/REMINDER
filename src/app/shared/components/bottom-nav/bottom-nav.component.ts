import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 dark:bg-[#1B2E40]/95 backdrop-blur-lg border-t border-[#D9E4EC] dark:border-[#365874] px-2 py-1 safe-area-bottom transition-colors duration-200">
      <div class="flex items-center justify-around">
        @for (item of navItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="text-[#1166B3] dark:text-[#ABDAF0] font-bold"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            class="flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] text-[#566B7E] dark:text-[#ABDAF0]/70 hover:text-[#1166B3] dark:hover:text-[#ABDAF0] transition-colors rounded-xl"
          >
            <!-- Icons -->
            <div class="h-6 w-6 flex items-center justify-center">
              @switch (item.icon) {
                @case ('home') {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
                @case ('calendar') {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                @case ('reminders') {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                }
                @case ('birthdays') {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M3 21h18a1 1 0 001-1v-7a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1z" />
                  </svg>
                }
                @case ('settings') {
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              }
            </div>
            <span class="text-[10px] mt-0.5 tracking-tight">{{ item.label }}</span>
          </a>
        }
      </div>
    </nav>
  `
})
export class BottomNavComponent {
  readonly navItems: NavItem[] = [
    { label: 'Home', route: '/dashboard', icon: 'home' },
    { label: 'Calendar', route: '/calendar', icon: 'calendar' },
    { label: 'Reminders', route: '/reminders', icon: 'reminders' },
    { label: 'Birthdays', route: '/birthdays', icon: 'birthdays' },
    { label: 'Settings', route: '/settings', icon: 'settings' }
  ];
}
