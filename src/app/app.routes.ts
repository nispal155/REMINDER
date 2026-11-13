import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard - REMINDER'
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent),
    title: 'Calendar - REMINDER'
  },
  {
    path: 'reminders',
    loadComponent: () => import('./features/reminders/reminders.component').then(m => m.RemindersComponent),
    title: 'Reminders - REMINDER'
  },
  {
    path: 'birthdays',
    loadComponent: () => import('./features/birthdays/birthdays.component').then(m => m.BirthdaysComponent),
    title: 'Birthdays - REMINDER'
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
    title: 'Settings - REMINDER'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
