import { addDays } from 'date-fns';
import {
  calculateBestStreak,
  calculateCompletionRate,
  calculateCurrentStreak,
  isHabitScheduledOnDate
} from '@/utils/habitCalculations';
import { Habit, HabitLog } from '@/types';
import { toISODate, startOfToday } from '@/utils/date';

describe('habit calculations', () => {
  const baseHabit: Habit = {
    id: '1',
    name: 'Test Habit',
    color: '#fff',
    schedule: { type: 'daily' },
    streak: 0,
    bestStreak: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } as Habit;

  it('detects schedule correctly for custom days', () => {
    const habit = { ...baseHabit, schedule: { type: 'custom', daysOfWeek: [1, 3, 5] } };
    const monday = new Date('2024-01-01');
    expect(isHabitScheduledOnDate(habit, monday)).toBe(true);
    const tuesday = new Date('2024-01-02');
    expect(isHabitScheduledOnDate(habit, tuesday)).toBe(false);
  });

  it('calculates current streak for daily habit', () => {
    const today = startOfToday();
    const logs: HabitLog[] = [];
    for (let i = 0; i < 5; i += 1) {
      logs.push({ id: String(i), habitId: '1', date: toISODate(addDays(today, -i)), completed: true });
    }
    const streak = calculateCurrentStreak(baseHabit, logs);
    expect(streak).toBe(5);
  });

  it('calculates best streak with gaps', () => {
    const today = startOfToday();
    const logs: HabitLog[] = [
      { id: '1', habitId: '1', date: toISODate(addDays(today, -5)), completed: true },
      { id: '2', habitId: '1', date: toISODate(addDays(today, -4)), completed: true },
      { id: '3', habitId: '1', date: toISODate(addDays(today, -2)), completed: true },
      { id: '4', habitId: '1', date: toISODate(addDays(today, -1)), completed: true }
    ];
    const best = calculateBestStreak(baseHabit, logs);
    expect(best).toBe(2);
  });
  it('calculates completion rate over last 7 days', () => {
    const habit = baseHabit;
    const today = startOfToday();
    const logs: HabitLog[] = [];
    for (let i = 0; i < 7; i += 1) {
      const date = toISODate(addDays(today, -i));
      logs.push({ id: String(i), habitId: habit.id, date, completed: i % 2 === 0 });
    }
    const completion = calculateCompletionRate([habit], { [habit.id]: logs });
    expect(completion).toBeGreaterThan(0);
    expect(completion).toBeLessThanOrEqual(1);
  });
});
