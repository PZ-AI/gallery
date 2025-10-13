export type ScheduleType = 'daily' | 'weekly' | 'custom';

export interface HabitSchedule {
  type: ScheduleType;
  daysOfWeek?: number[]; // 0 (Sunday) - 6 (Saturday)
  timesPerWeek?: number;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  schedule: HabitSchedule;
  reminderTime?: string; // HH:mm format
  streak: number;
  bestStreak: number;
  lastCompletedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitInput {
  id?: string;
  name: string;
  description?: string;
  color: string;
  schedule: HabitSchedule;
  reminderTime?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // yyyy-MM-dd
  completed: boolean;
}

export interface AnalyticsSummary {
  completionRate: number;
  totalHabits: number;
  activeStreaks: number;
}
