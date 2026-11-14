import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GlobalSearchService, GlobalSearchResult } from '../../../core/services/global-search.service';

@Component({
  selector: 'app-global-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-20 bg-black/60 backdrop-blur-sm animate-fade-in"
        (click)="closeModal()"
      >
        <div
          class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
          (click)="$event.stopPropagation()"
        >
          <!-- Search Header Input -->
          <div class="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 space-x-3">
            <span class="text-slate-400 text-lg">🔍</span>
            <input
              #searchInput
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onQueryChanged($event)"
              placeholder="Search reminders, events, birthdays, festivals (BS/AD)..."
              class="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              autofocus
            />
            <kbd class="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          <!-- Search Results Container -->
          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            @if (isLoading()) {
              <div class="py-8 text-center text-xs text-slate-400">Searching...</div>
            } @else if (results().length > 0) {
              @for (item of results(); track item.id) {
                <button
                  type="button"
                  (click)="onSelectResult(item)"
                  class="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                >
                  <div class="flex items-center space-x-3 min-w-0">
                    <span class="text-xl shrink-0">
                      @switch (item.type) {
                        @case ('reminder') { 🔔 }
                        @case ('event') { 📅 }
                        @case ('birthday') { 🎂 }
                        @case ('festival') { 🎉 }
                      }
                    </span>
                    <div class="min-w-0">
                      <p class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {{ item.title }}
                      </p>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {{ item.subtitle }}
                      </p>
                    </div>
                  </div>

                  @if (item.badge) {
                    <span class="shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {{ item.badge }}
                    </span>
                  }
                </button>
              }
            } @else if (searchQuery.trim().length > 1) {
              <div class="py-8 text-center text-xs text-slate-400">
                No matching reminders, events, or festivals found.
              </div>
            } @else {
              <div class="py-8 text-center text-xs text-slate-400">
                Type keywords, English or Nepali dates (e.g. "Dashain", "Electricity", "2081-07") to search.
              </div>
            }
          </div>

          <!-- Footer Shortcut info -->
          <div class="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Unified offline search across all modules</span>
            <span>Shortcut: <strong>Ctrl/⌘ + K</strong></span>
          </div>

        </div>
      </div>
    }
  `
})
export class GlobalSearchModalComponent {
  private readonly searchService = inject(GlobalSearchService);
  private readonly router = inject(Router);

  readonly isOpen = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly results = signal<GlobalSearchResult[]>([]);
  searchQuery = '';

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Open on Ctrl+K or Cmd+K
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openModal();
    }
    // Close on Escape
    if (event.key === 'Escape' && this.isOpen()) {
      this.closeModal();
    }
  }

  openModal() {
    this.searchQuery = '';
    this.results.set([]);
    this.isOpen.set(true);
  }

  closeModal() {
    this.isOpen.set(false);
  }

  async onQueryChanged(query: string) {
    if (query.trim().length < 2) {
      this.results.set([]);
      return;
    }
    this.isLoading.set(true);
    const hits = await this.searchService.search(query);
    this.results.set(hits);
    this.isLoading.set(false);
  }

  onSelectResult(item: GlobalSearchResult) {
    this.closeModal();
    this.router.navigateByUrl(item.route);
  }
}
