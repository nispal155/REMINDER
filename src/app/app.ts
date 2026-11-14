import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ConflictModalComponent } from './shared/components/conflict-modal/conflict-modal.component';
import { GlobalSearchModalComponent } from './shared/components/global-search/global-search-modal.component';
import { ReminderFormComponent } from './features/reminders/components/reminder-form/reminder-form.component';
import { ReminderService } from './features/reminders/reminder.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    BottomNavComponent,
    ToastContainerComponent,
    ModalComponent,
    ConflictModalComponent,
    GlobalSearchModalComponent,
    ReminderFormComponent
  ],
  styleUrl: './app.css',
  templateUrl: './app.html'
})
export class App implements OnInit {
  readonly reminderService = inject(ReminderService);
  private readonly notificationService = inject(NotificationService);
  readonly showGlobalQuickAdd = signal<boolean>(false);

  ngOnInit() {
    // Listen to notification action clicks (Complete / Snooze)
    this.notificationService.actionReceived$.subscribe(async (msg) => {
      const rem = await this.reminderService.allReminders().find(r => r.id === msg.reminderId);
      if (rem) {
        if (msg.action === 'complete') {
          await this.reminderService.toggleComplete(rem);
        } else if (msg.action === 'snooze') {
          await this.reminderService.snoozeReminder(rem, '15m');
        }
      }
    });
  }

  async onSaveReminder(data: any) {
    await this.reminderService.addReminder(data);
    this.showGlobalQuickAdd.set(false);
  }
}
