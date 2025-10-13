import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { addMonths, format, subMonths } from 'date-fns';
import { Habit, HabitLog } from '@/types';
import { AppTheme } from '@/styles/theme';
import { ThemedText } from '@/components/layout/ThemedText';
import { getDatesForMonth, toISODate } from '@/utils/date';
import { isHabitScheduledOnDate } from '@/utils/habitCalculations';

interface HabitCalendarProps {
  habit: Habit;
  logs: HabitLog[];
  theme: AppTheme;
}

export const HabitCalendar: React.FC<HabitCalendarProps> = ({ habit, logs, theme }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const completions = new Set(logs.filter((log) => log.completed).map((log) => log.date));
  const days = getDatesForMonth(currentDate);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setCurrentDate((prev) => subMonths(prev, 1))}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <ThemedText theme={theme}>{'<'}</ThemedText>
        </Pressable>
        <ThemedText theme={theme} variant="title" accessibilityLabel={`Calendar for ${format(currentDate, 'MMMM yyyy')}`}>
          {format(currentDate, 'MMMM yyyy')}
        </ThemedText>
        <Pressable
          onPress={() => setCurrentDate((prev) => addMonths(prev, 1))}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <ThemedText theme={theme}>{'>'}</ThemedText>
        </Pressable>
      </View>
      <View style={styles.weekDays}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label) => (
          <ThemedText key={label} theme={theme} style={styles.weekDay} accessibilityLabel={label}>
            {label}
          </ThemedText>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((date) => {
          const iso = toISODate(date);
          const completed = completions.has(iso);
          const scheduled = isHabitScheduledOnDate(habit, date);
          return (
            <View key={iso} style={styles.dayCell} accessibilityLabel={`${format(date, 'do MMMM')}${completed ? ' completed' : ''}`}>
              <View
                style={[
                  styles.day,
                  {
                    borderColor: scheduled ? habit.color : 'transparent',
                    backgroundColor: completed ? habit.color : 'transparent'
                  }
                ]}
              >
                <ThemedText
                  theme={theme}
                  style={{
                    color: completed ? '#FFFFFF' : theme.text
                  }}
                >
                  {format(date, 'd')}
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  weekDay: {
    flex: 1,
    textAlign: 'center'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayCell: {
    width: '14.28%',
    padding: 4,
    alignItems: 'center'
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
