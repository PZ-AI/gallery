import * as SQLite from 'expo-sqlite';
import { SQLResultSet } from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';
import { Habit, HabitInput, HabitLog, HabitSchedule } from '@/types';
import { calculateBestStreak, calculateCurrentStreak } from '@/utils/habitCalculations';
import { startOfToday, toISODate } from '@/utils/date';

const database = SQLite.openDatabase('habits.db');

const runQuery = (
  query: string,
  params: any[] = []
): Promise<SQLResultSet> =>
  new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        query,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });

const parseHabitRow = (row: any): Habit => ({
  id: row.id,
  name: row.name,
  description: row.description ?? undefined,
  color: row.color,
  schedule: JSON.parse(row.schedule) as HabitSchedule,
  reminderTime: row.reminderTime ?? undefined,
  streak: row.streak ?? 0,
  bestStreak: row.bestStreak ?? 0,
  lastCompletedDate: row.lastCompletedDate ?? undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt
});

const parseLogRow = (row: any): HabitLog => ({
  id: row.id,
  habitId: row.habitId,
  date: row.date,
  completed: row.completed === 1
});

export const initDatabase = async () => {
  await runQuery(
    `CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT NOT NULL,
      schedule TEXT NOT NULL,
      reminderTime TEXT,
      streak INTEGER DEFAULT 0,
      bestStreak INTEGER DEFAULT 0,
      lastCompletedDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )`
  );

  await runQuery(
    `CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY NOT NULL,
      habitId TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(habitId) REFERENCES habits(id) ON DELETE CASCADE
    )`
  );

  await runQuery(
    `CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT
    )`
  );

  await runQuery(
    `CREATE TABLE IF NOT EXISTS habit_notifications (
      habitId TEXT NOT NULL,
      notificationId TEXT NOT NULL,
      PRIMARY KEY (habitId, notificationId)
    )`
  );

  await seedInitialData();
};

const seedInitialData = async () => {
  const seeded = await runQuery('SELECT value FROM metadata WHERE key = ?', ['seeded']);
  if (seeded.rows.length > 0) {
    return;
  }

  const now = new Date().toISOString();
  const todayISO = toISODate(startOfToday());

  const habits: Habit[] = [
    {
      id: uuidv4(),
      name: 'Morning Run',
      description: 'Run for at least 20 minutes',
      color: '#FF6B6B',
      schedule: { type: 'custom', daysOfWeek: [1, 3, 5] },
      reminderTime: '07:00',
      streak: 0,
      bestStreak: 0,
      lastCompletedDate: undefined,
      createdAt: now,
      updatedAt: now
    },
    {
      id: uuidv4(),
      name: 'Meditation',
      description: '10 minutes of mindfulness',
      color: '#4ECDC4',
      schedule: { type: 'daily' },
      reminderTime: '08:00',
      streak: 0,
      bestStreak: 0,
      lastCompletedDate: undefined,
      createdAt: now,
      updatedAt: now
    },
    {
      id: uuidv4(),
      name: 'Read a book',
      description: 'Read 20 pages',
      color: '#5567FF',
      schedule: { type: 'weekly', timesPerWeek: 3 },
      reminderTime: '21:00',
      streak: 0,
      bestStreak: 0,
      lastCompletedDate: undefined,
      createdAt: now,
      updatedAt: now
    }
  ];

  for (const habit of habits) {
    await runQuery(
      `INSERT INTO habits (id, name, description, color, schedule, reminderTime, streak, bestStreak, lastCompletedDate, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        habit.id,
        habit.name,
        habit.description ?? null,
        habit.color,
        JSON.stringify(habit.schedule),
        habit.reminderTime ?? null,
        habit.streak,
        habit.bestStreak,
        habit.lastCompletedDate ?? null,
        habit.createdAt,
        habit.updatedAt
      ]
    );

    await runQuery(
      `INSERT INTO habit_logs (id, habitId, date, completed, createdAt)
      VALUES (?, ?, ?, ?, ?)` ,
      [uuidv4(), habit.id, todayISO, 1, now]
    );
  }

  await runQuery('INSERT INTO metadata (key, value) VALUES (?, ?)', ['seeded', 'true']);
};

export const getHabits = async (): Promise<Habit[]> => {
  const result = await runQuery('SELECT * FROM habits ORDER BY createdAt DESC');
  const habits: Habit[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    habits.push(parseHabitRow(result.rows.item(i)));
  }
  return habits;
};

export const getHabitLogs = async (habitId: string): Promise<HabitLog[]> => {
  const result = await runQuery('SELECT * FROM habit_logs WHERE habitId = ? ORDER BY date DESC', [habitId]);
  const logs: HabitLog[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    logs.push(parseLogRow(result.rows.item(i)));
  }
  return logs;
};

export const createHabit = async (habit: HabitInput): Promise<string> => {
  const id = habit.id ?? uuidv4();
  const now = new Date().toISOString();
  await runQuery(
    `INSERT INTO habits (id, name, description, color, schedule, reminderTime, streak, bestStreak, lastCompletedDate, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      habit.name,
      habit.description ?? null,
      habit.color,
      JSON.stringify(habit.schedule),
      habit.reminderTime ?? null,
      0,
      0,
      null,
      now,
      now
    ]
  );

  return id;
};

export const updateHabit = async (habit: Habit) => {
  const now = new Date().toISOString();
  await runQuery(
    `UPDATE habits SET name = ?, description = ?, color = ?, schedule = ?, reminderTime = ?, streak = ?, bestStreak = ?, lastCompletedDate = ?, updatedAt = ? WHERE id = ?`,
    [
      habit.name,
      habit.description ?? null,
      habit.color,
      JSON.stringify(habit.schedule),
      habit.reminderTime ?? null,
      habit.streak,
      habit.bestStreak,
      habit.lastCompletedDate ?? null,
      now,
      habit.id
    ]
  );
};

export const deleteHabit = async (habitId: string) => {
  await runQuery('DELETE FROM habit_notifications WHERE habitId = ?', [habitId]);
  await runQuery('DELETE FROM habit_logs WHERE habitId = ?', [habitId]);
  await runQuery('DELETE FROM habits WHERE id = ?', [habitId]);
};

export const logHabitCompletion = async (habitId: string, date: string, completed: boolean) => {
  const existing = await runQuery(
    'SELECT * FROM habit_logs WHERE habitId = ? AND date = ?',
    [habitId, date]
  );

  if (existing.rows.length > 0) {
    await runQuery('UPDATE habit_logs SET completed = ?, createdAt = ? WHERE habitId = ? AND date = ?', [completed ? 1 : 0, new Date().toISOString(), habitId, date]);
  } else {
    await runQuery(
      `INSERT INTO habit_logs (id, habitId, date, completed, createdAt)
      VALUES (?, ?, ?, ?, ?)` ,
      [uuidv4(), habitId, date, completed ? 1 : 0, new Date().toISOString()]
    );
  }

  const habitResult = await runQuery('SELECT * FROM habits WHERE id = ?', [habitId]);
  if (habitResult.rows.length === 0) return;
  const habit = parseHabitRow(habitResult.rows.item(0));
  const logs = await getHabitLogs(habitId);
  const streak = calculateCurrentStreak(habit, logs);
  const bestStreak = calculateBestStreak(habit, logs);
  const lastCompletedDate = logs.find((log) => log.completed)?.date;

  await runQuery(
    'UPDATE habits SET streak = ?, bestStreak = ?, lastCompletedDate = ?, updatedAt = ? WHERE id = ?',
    [streak, bestStreak, lastCompletedDate ?? null, new Date().toISOString(), habitId]
  );
};

export const getAllHabitLogs = async (): Promise<Record<string, HabitLog[]>> => {
  const result = await runQuery('SELECT * FROM habit_logs ORDER BY date DESC');
  const logsMap: Record<string, HabitLog[]> = {};
  for (let i = 0; i < result.rows.length; i += 1) {
    const log = parseLogRow(result.rows.item(i));
    if (!logsMap[log.habitId]) {
      logsMap[log.habitId] = [];
    }
    logsMap[log.habitId].push(log);
  }
  return logsMap;
};

export const saveHabitNotification = async (habitId: string, notificationId: string) => {
  await runQuery(
    'INSERT OR REPLACE INTO habit_notifications (habitId, notificationId) VALUES (?, ?)',
    [habitId, notificationId]
  );
};

export const getHabitNotifications = async (habitId: string): Promise<string[]> => {
  const result = await runQuery('SELECT notificationId FROM habit_notifications WHERE habitId = ?', [habitId]);
  const ids: string[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    ids.push(result.rows.item(i).notificationId);
  }
  return ids;
};

export const clearHabitNotifications = async (habitId: string) => {
  await runQuery('DELETE FROM habit_notifications WHERE habitId = ?', [habitId]);
};

export const syncPendingChanges = async () => {
  // Placeholder for remote sync integration.
  // In a production-ready app, this function would push local changes to a backend service
  // when network connectivity is restored and fetch updates. The structure is ready for extension.
  return true;
};
