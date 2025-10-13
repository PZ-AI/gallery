import { differenceInCalendarDays, isSameDay, subDays } from 'date-fns';
import { Habit, HabitLog } from '@/types';
import { getLast7Days, parseISODate, startOfToday, toISODate } from './date';

export const isHabitScheduledOnDate = (habit: Habit, date: Date): boolean => {
  const day = date.getDay();
  switch (habit.schedule.type) {
    case 'daily':
      return true;
    case 'weekly':
      if (!habit.schedule.timesPerWeek) return true;
      // For weekly schedule with timesPerWeek, allow completions distributed but we consider scheduled days as evenly spaced.
      // We'll treat all days as potential but analytics will look at completions.
      return true;
    case 'custom':
      return habit.schedule.daysOfWeek?.includes(day) ?? false;
    default:
      return false;
  }
};

const findPreviousScheduledDate = (habit: Habit, fromDate: Date) => {
  let cursor = subDays(fromDate, 1);
  for (let i = 0; i < 366; i += 1) {
    if (isHabitScheduledOnDate(habit, cursor)) {
      return cursor;
    }
    cursor = subDays(cursor, 1);
  }
  return undefined;
};

const findNextScheduledDate = (habit: Habit, fromDate: Date) => {
  let cursor = new Date(fromDate);
  cursor.setDate(cursor.getDate() + 1);
  for (let i = 0; i < 366; i += 1) {
    if (isHabitScheduledOnDate(habit, cursor)) {
      return cursor;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return undefined;
};

export const calculateCurrentStreak = (habit: Habit, logs: HabitLog[]): number => {
  const completions = new Set(
    logs.filter((log) => log.completed).map((log) => log.date)
  );
  let streak = 0;
  let cursor = startOfToday();
  let safety = 0;

  while (safety < 366) {
    safety += 1;
    if (isHabitScheduledOnDate(habit, cursor)) {
      const iso = toISODate(cursor);
      if (completions.has(iso)) {
        streak += 1;
        const previous = findPreviousScheduledDate(habit, cursor);
        if (!previous) break;
        cursor = previous;
        continue;
      }
      break;
    }
    const previous = findPreviousScheduledDate(habit, cursor);
    if (!previous) break;
    cursor = previous;
  }

  return streak;
};

export const calculateBestStreak = (habit: Habit, logs: HabitLog[]): number => {
  const completedLogs = logs.filter((log) => log.completed);
  if (completedLogs.length === 0) return 0;
  const sorted = completedLogs
    .map((log) => parseISODate(log.date))
    .sort((a, b) => a.getTime() - b.getTime());

  let best = 0;
  let current = 0;
  let previous: Date | undefined;

  for (const date of sorted) {
    if (!isHabitScheduledOnDate(habit, date)) {
      continue;
    }
    if (!previous) {
      current = 1;
      previous = date;
      best = Math.max(best, current);
      continue;
    }
    const expectedNext = findNextScheduledDate(habit, previous);
    if (expectedNext && isSameDay(expectedNext, date)) {
      current += 1;
    } else {
      current = 1;
    }
    previous = date;
    best = Math.max(best, current);
  }

  return best;
};

export const calculateCompletionRate = (
  habits: Habit[],
  logs: Record<string, HabitLog[]>
): number => {
  const lastWeek = getLast7Days();
  let scheduledCount = 0;
  let completedCount = 0;

  for (const habit of habits) {
    if (habit.schedule.type === 'weekly' && habit.schedule.timesPerWeek) {
      const weeklyTarget = habit.schedule.timesPerWeek;
      scheduledCount += weeklyTarget;
      const completions = (logs[habit.id] ?? []).filter((log) => {
        const logDate = parseISODate(log.date);
        return log.completed && lastWeek.some((day) => isSameDay(day, logDate));
      }).length;
      completedCount += Math.min(completions, weeklyTarget);
      continue;
    }

    for (const day of lastWeek) {
      if (isHabitScheduledOnDate(habit, day)) {
        scheduledCount += 1;
        const iso = toISODate(day);
        const hasCompleted = logs[habit.id]?.some((log) => log.date === iso && log.completed);
        if (hasCompleted) {
          completedCount += 1;
        }
      }
    }
  }

  if (scheduledCount === 0) return 0;
  return completedCount / scheduledCount;
};

export const isHabitCompletedOnDate = (
  habit: Habit,
  logs: HabitLog[],
  date: Date
): boolean => {
  const iso = toISODate(date);
  return logs.some((log) => log.date === iso && log.completed);
};

export const getMissedScheduledDates = (habit: Habit, logs: HabitLog[]): string[] => {
  const today = startOfToday();
  const earliestLog = logs.reduce<string | undefined>((min, log) => {
    if (!log.completed) return min;
    if (!min) return log.date;
    return log.date < min ? log.date : min;
  }, undefined);

  if (!earliestLog) return [];

  const earliestDate = parseISODate(earliestLog);
  const missed: string[] = [];

  for (let cursor = earliestDate; differenceInCalendarDays(today, cursor) >= 0; cursor = new Date(cursor.getTime() + 86400000)) {
    if (!isHabitScheduledOnDate(habit, cursor)) continue;
    const iso = toISODate(cursor);
    const wasCompleted = logs.some((log) => log.date === iso && log.completed);
    if (!wasCompleted) {
      missed.push(iso);
    }
  }

  return missed;
};
