import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { RootStackParamList } from '@/navigation/types';
import { useHabitStore } from '@/store/useHabitStore';
import { getTheme } from '@/styles/theme';
import { ThemedView } from '@/components/layout/ThemedView';
import { ThemedText } from '@/components/layout/ThemedText';
import { HabitCalendar } from '@/components/habits/HabitCalendar';
import { formatDisplayTime } from '@/utils/date';
import { translate } from '@/i18n';

export type HabitDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'HabitDetail'>;

export const HabitDetailScreen: React.FC<HabitDetailScreenProps> = ({ route, navigation }) => {
  const { habitId } = route.params;
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { habits, logs, toggleCompletion, loading } = useHabitStore();
  const habit = useMemo(() => habits.find((item) => item.id === habitId), [habits, habitId]);

  if (loading) {
    return (
      <ThemedView theme={theme} style={styles.centered}>
        <ActivityIndicator color={theme.primary} accessibilityLabel="Loading habit" />
      </ThemedView>
    );
  }

  if (!habit) {
    return (
      <ThemedView theme={theme} style={styles.centered}>
        <ThemedText theme={theme} accessibilityLabel="Habit not found">
          Habit not found
        </ThemedText>
      </ThemedView>
    );
  }

  const reminderText = habit.reminderTime
    ? translate('habitDetail.reminderSet', { time: formatDisplayTime(habit.reminderTime) })
    : translate('habitDetail.noReminder');

  return (
    <ThemedView theme={theme}>
      <ScrollView contentContainerStyle={styles.content} accessibilityLabel="Habit detail">
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          accessibilityLabel={`Habit details for ${habit.name}`}
        >
          <ThemedText theme={theme} variant="title" style={styles.title}>
            {habit.name}
          </ThemedText>
          {habit.description ? (
            <ThemedText theme={theme} variant="muted">
              {habit.description}
            </ThemedText>
          ) : null}
          <ThemedText theme={theme} style={styles.streak} accessibilityLabel={`${translate('habitDetail.streak')} ${habit.streak}`}>
            🔥 {habit.streak} {translate('habitDetail.streak')}
          </ThemedText>
          <ThemedText theme={theme} style={styles.reminder} accessibilityLabel={reminderText}>
            {reminderText}
          </ThemedText>
          <Pressable
            onPress={() => toggleCompletion(habit.id)}
            style={[styles.completeButton, { backgroundColor: theme.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Toggle completion for today"
          >
            <ThemedText theme={theme} style={[styles.completeText, { color: '#FFFFFF' }]}>
              {translate('habitDetail.markToday')}
            </ThemedText>
          </Pressable>
        </View>

        <HabitCalendar habit={habit} logs={logs[habit.id] ?? []} theme={theme} />
      </ScrollView>
      <Pressable
        onPress={() => navigation.navigate('HabitForm', { habitId })}
        style={[styles.editButton, { borderColor: theme.border, backgroundColor: theme.background }]}
        accessibilityRole="button"
        accessibilityLabel={translate('habitDetail.edit')}
      >
        <ThemedText theme={theme}>{translate('habitDetail.edit')}</ThemedText>
      </Pressable>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 120
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20
  },
  title: {
    marginBottom: 8
  },
  streak: {
    marginTop: 12,
    fontWeight: '600'
  },
  reminder: {
    marginTop: 8
  },
  completeButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center'
  },
  completeText: {
    fontWeight: '600'
  },
  editButton: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
