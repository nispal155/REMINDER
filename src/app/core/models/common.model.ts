export interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

export interface DashboardStats {
  totalReminders: number;
  dueToday: number;
  upcoming: number;
  completed: number;
  birthdaysThisMonth: number;
}

