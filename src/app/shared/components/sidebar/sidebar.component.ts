import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="hidden md:flex flex-col w-64 bg-[#FFFFFF] dark:bg-[#1B2E40] border-r border-[#D9E4EC] dark:border-[#365874] h-screen sticky top-0 p-4 justify-between transition-colors duration-200">
      <div>
        <!-- ASTRA Brand Lockup -->
        <div class="flex items-center space-x-3 px-2 py-3 mb-6">
          <div class="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1166B3] via-[#2A86CB] to-[#7DC0E5] flex items-center justify-center text-white shadow-lg shadow-[#1166B3]/30 border border-[#ABDAF0]/30 shrink-0">
            <!-- ASTRA Stylized Star Emblem -->
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 2L15 9L22 9L16.5 13.5L18.5 20.5L12 16L5.5 20.5L7.5 13.5L2 9L9 9Z" fill="white" />
              <path d="M12 2L14 10L22 9" stroke="#ABDAF0" stroke-width="1.5" />
            </svg>
          </div>
          <div class="min-w-0">
            <h2 class="text-base font-black text-[#142536] dark:text-white tracking-wider leading-none">ASTRA</h2>
            <p class="text-[9px] font-bold text-[#1166B3] dark:text-[#7DC0E5] tracking-widest uppercase mt-0.5">
              TECHNOLOGY HORIZON
            </p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1.5">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-[#E9F0F6] dark:bg-[#27465F] text-[#1166B3] dark:text-[#ABDAF0] font-bold shadow-xs border-l-3 border-[#1166B3] dark:border-[#7DC0E5]"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm text-[#566B7E] dark:text-[#ABDAF0]/80 hover:bg-[#F5F8FC] dark:hover:bg-[#27465F]/50 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </a>

          <a
            routerLink="/calendar"
            routerLinkActive="bg-[#E9F0F6] dark:bg-[#27465F] text-[#1166B3] dark:text-[#ABDAF0] font-bold shadow-xs border-l-3 border-[#1166B3] dark:border-[#7DC0E5]"
            class="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm text-[#566B7E] dark:text-[#ABDAF0]/80 hover:bg-[#F5F8FC] dark:hover:bg-[#27465F]/50 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Calendar (BS / AD)</span>
          </a>

          <a
            routerLink="/reminders"
            routerLinkActive="bg-[#E9F0F6] dark:bg-[#27465F] text-[#1166B3] dark:text-[#ABDAF0] font-bold shadow-xs border-l-3 border-[#1166B3] dark:border-[#7DC0E5]"
            class="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm text-[#566B7E] dark:text-[#ABDAF0]/80 hover:bg-[#F5F8FC] dark:hover:bg-[#27465F]/50 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Reminders</span>
          </a>

          <a
            routerLink="/birthdays"
            routerLinkActive="bg-[#E9F0F6] dark:bg-[#27465F] text-[#1166B3] dark:text-[#ABDAF0] font-bold shadow-xs border-l-3 border-[#1166B3] dark:border-[#7DC0E5]"
            class="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm text-[#566B7E] dark:text-[#ABDAF0]/80 hover:bg-[#F5F8FC] dark:hover:bg-[#27465F]/50 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M3 21h18a1 1 0 001-1v-7a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1z" />
            </svg>
            <span>Birthdays</span>
          </a>

          <a
            routerLink="/events"
            routerLinkActive="bg-[#E9F0F6] dark:bg-[#27465F] text-[#1166B3] dark:text-[#ABDAF0] font-bold shadow-xs border-l-3 border-[#1166B3] dark:border-[#7DC0E5]"
            class="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm text-[#566B7E] dark:text-[#ABDAF0]/80 hover:bg-[#F5F8FC] dark:hover:bg-[#27465F]/50 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span>Events</span>
          </a>

          <a
            routerLink="/settings"
            routerLinkActive="bg-[#E9F0F6] dark:bg-[#27465F] text-[#1166B3] dark:text-[#ABDAF0] font-bold shadow-xs border-l-3 border-[#1166B3] dark:border-[#7DC0E5]"
            class="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm text-[#566B7E] dark:text-[#ABDAF0]/80 hover:bg-[#F5F8FC] dark:hover:bg-[#27465F]/50 transition-colors"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </a>
        </nav>
      </div>

      <!-- Local Status Card -->
      <div class="p-3 rounded-2xl bg-[#F5F8FC] dark:bg-[#27465F]/60 border border-[#D9E4EC] dark:border-[#365874] text-xs">
        <div class="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>IndexedDB Active</span>
        </div>
        <p class="text-[11px] text-[#566B7E] dark:text-[#ABDAF0]/70">
          ASTRA Personal Workspace
        </p>
      </div>
    </aside>
  `
})
export class SidebarComponent {}
