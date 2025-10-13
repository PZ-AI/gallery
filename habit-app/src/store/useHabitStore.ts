import { create } from 'zustand';
import { Habit, HabitInput, HabitLog, AnalyticsSummary } from '@/types';
import {
  clearHabitNotifications,
  createHabit,
  deleteHabit,
  getAllHabitLogs,
  getHabits,
  getHabitNotifications,
  initDatabase,
  logHabitCompletion,
  updateHabit,
  syncPendingChanges
} from '@/services/database';
import { scheduleHabitNotifications, cancelHabitNotifications } from '@/services/notifications';
import { calculateCompletionRate } from '@/utils/habitCalculations';
import { toISODate, startOfToday } from '@/utils/date';

interface HabitState {
  habits: Habit[];
  logs: Record<string, HabitLog[]>;
  analytics: AnalyticsSummary;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  addHabit: (habit: HabitInput) => Promise<string | undefined>;
  editHabit: (habit: Habit) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
  toggleCompletion: (habitId: string, date?: string) => Promise<void>;
}

const defaultAnalytics: AnalyticsSummary = {
  completionRate: 0,
  totalHabits: 0,
  activeStreaks: 0
};

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: {},
  analytics: defaultAnalytics,
  loading: false,
  initialized: false,
  init: async () => {
    if (get().initialized) return;
    set({ loading: true });
    await initDatabase();
    await get().refresh();
    set({ initialized: true, loading: false });
  },
  refresh: async () => {
    await syncPendingChanges();
    const [habits, logs] = await Promise.all([getHabits(), getAllHabitLogs()]);
    const analytics: AnalyticsSummary = {
      completionRate: calculateCompletionRate(habits, logs),
      totalHabits: habits.length,
      activeStreaks: habits.filter((habit) => habit.streak > 0).length
    };
    set({ habits, logs, analytics });
  },
  addHabit: async (habit) => {
    const id = await createHabit(habit);
    await get().refresh();
    const createdHabit = get().habits.find((item) => item.id === id);
    if (createdHabit) {
      await scheduleHabitNotifications(createdHabit);
    }
    return id;
  },
  editHabit: async (habit) => {
    await updateHabit(habit);
    await scheduleHabitNotifications(habit);
    await get().refresh();
  },
  removeHabit: async (habitId) => {
    const notificationIds = await getHabitNotifications(habitId);
    if (notificationIds.length > 0) {
      await cancelHabitNotifications(notificationIds);
      await clearHabitNotifications(habitId);
    }
    await deleteHabit(habitId);
    await get().refresh();
  },
  toggleCompletion: async (habitId, date) => {
    const targetDate = date ?? toISODate(startOfToday());
    const logs = get().logs[habitId] ?? [];
    const alreadyCompleted = logs.some((log) => log.date === targetDate && log.completed);
    await logHabitCompletion(habitId, targetDate, !alreadyCompleted);
    await get().refresh();
  }
}));
