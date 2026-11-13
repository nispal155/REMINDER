import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { ButtonComponent } from './shared/components/button/button.component';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ReminderService } from './features/reminders/reminder.service';
import { Priority } from './core/models/reminder.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ReactiveFormsModule,
    HeaderComponent,
    SidebarComponent,
    BottomNavComponent,
    ToastContainerComponent,
    ModalComponent,
    ButtonComponent
  ],
  styleUrl: './app.css',
  templateUrl: './app.html'
})
export class App {
  readonly reminderService = inject(ReminderService);
  private readonly fb = inject(FormBuilder);

  readonly showGlobalQuickAdd = signal<boolean>(false);

  readonly quickAddForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    dateAD: [new Date().toISOString().split('T')[0], Validators.required],
    time: ['12:00', Validators.required],
    priority: ['medium' as Priority, Validators.required],
    category: ['General', Validators.required]
  });

  async onSubmitQuickReminder() {
    if (this.quickAddForm.invalid) return;
    const val = this.quickAddForm.value;

    await this.reminderService.addReminder({
      title: val.title!,
      description: val.description || undefined,
      dateAD: val.dateAD!,
      time: val.time!,
      priority: val.priority as Priority,
      category: val.category!
    });

    this.quickAddForm.reset({
      title: '',
      description: '',
      dateAD: new Date().toISOString().split('T')[0],
      time: '12:00',
      priority: 'medium',
      category: 'General'
    });
    this.showGlobalQuickAdd.set(false);
  }
}
