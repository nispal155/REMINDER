import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ReminderFormComponent } from './features/reminders/components/reminder-form/reminder-form.component';
import { ReminderService } from './features/reminders/reminder.service';

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
    ReminderFormComponent
  ],
  styleUrl: './app.css',
  templateUrl: './app.html'
})
export class App {
  readonly reminderService = inject(ReminderService);
  readonly showGlobalQuickAdd = signal<boolean>(false);

  async onSaveReminder(data: any) {
    await this.reminderService.addReminder(data);
    this.showGlobalQuickAdd.set(false);
  }
}
