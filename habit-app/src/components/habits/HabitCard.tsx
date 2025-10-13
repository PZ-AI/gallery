import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitLog } from '@/types';
import { AppTheme } from '@/styles/theme';
import { ThemedText } from '@/components/layout/ThemedText';
import { isHabitCompletedOnDate } from '@/utils/habitCalculations';
import { startOfToday } from '@/utils/date';

interface HabitCardProps {
  habit: Habit;
  logs: HabitLog[];
  theme: AppTheme;
  onPress: () => void;
  onToggle: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, logs, theme, onPress, onToggle }) => {
  const completedToday = isHabitCompletedOnDate(habit, logs, startOfToday());
  return (
    <Pressable
      style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${habit.name} card`}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={[styles.indicator, { backgroundColor: habit.color }]} accessibilityLabel={`Habit color ${habit.color}`} />
          <View style={styles.textContainer}>
            <ThemedText theme={theme} style={styles.title} numberOfLines={1} accessibilityLabel={`Habit name ${habit.name}`}>
              {habit.name}
            </ThemedText>
            {habit.description ? (
              <ThemedText theme={theme} variant="muted" numberOfLines={2} accessibilityLabel={`Habit description ${habit.description}`}>
                {habit.description}
              </ThemedText>
            ) : null}
            <ThemedText theme={theme} variant="muted" style={styles.streak} accessibilityLabel={`Current streak ${habit.streak} days`}>
              🔥 {habit.streak} · Best {habit.bestStreak}
            </ThemedText>
          </View>
        </View>
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          style={[styles.toggle, { borderColor: theme.border, backgroundColor: completedToday ? theme.primary : theme.background }]}
          accessibilityRole="switch"
          accessibilityState={{ checked: completedToday }}
          accessibilityLabel={`Mark ${habit.name} as ${completedToday ? 'incomplete' : 'complete'} for today`}
        >
          <Ionicons name={completedToday ? 'checkmark' : 'add'} size={20} color={completedToday ? '#FFFFFF' : theme.text} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1
  },
  indicator: {
    width: 12,
    height: 64,
    borderRadius: 12,
    marginRight: 16
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  streak: {
    marginTop: 8
  },
  toggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
