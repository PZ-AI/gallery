import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, View, Pressable } from 'react-native';
import { Habit, HabitInput, ScheduleType } from '@/types';
import { AppTheme } from '@/styles/theme';
import { ThemedText } from '@/components/layout/ThemedText';
import { COLORS, WEEK_DAYS } from '@/constants';
import { translate } from '@/i18n';

interface HabitFormProps {
  initialHabit?: Habit;
  theme: AppTheme;
  onSubmit: (habit: HabitInput & { id?: string }) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}

export const HabitForm: React.FC<HabitFormProps> = ({ initialHabit, theme, onSubmit, onDelete }) => {
  const [name, setName] = useState(initialHabit?.name ?? '');
  const [description, setDescription] = useState(initialHabit?.description ?? '');
  const [color, setColor] = useState(initialHabit?.color ?? COLORS[0]);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(initialHabit?.schedule.type ?? 'daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialHabit?.schedule.daysOfWeek ?? []);
  const [timesPerWeek, setTimesPerWeek] = useState(
    initialHabit?.schedule.timesPerWeek ? String(initialHabit.schedule.timesPerWeek) : '3'
  );
  const [reminderTime, setReminderTime] = useState(initialHabit?.reminderTime ?? '');

  const toggleDay = (index: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(index) ? prev.filter((day) => day !== index) : [...prev, index].sort()
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert(translate('habitForm.validationName'));
      return;
    }

    if (scheduleType === 'custom' && daysOfWeek.length === 0) {
      Alert.alert(translate('habitForm.validationSchedule'));
      return;
    }

    const habit: HabitInput & { id?: string } = {
      id: initialHabit?.id,
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      schedule:
        scheduleType === 'custom'
          ? { type: scheduleType, daysOfWeek }
          : scheduleType === 'weekly'
          ? { type: scheduleType, timesPerWeek: Number(timesPerWeek) || 1 }
          : { type: scheduleType },
      reminderTime: reminderTime || undefined
    };

    await onSubmit(habit);
  };

  const renderScheduleControls = () => {
    if (scheduleType === 'custom') {
      return (
        <View style={styles.daysContainer}>
          {WEEK_DAYS.map((day, index) => {
            const selected = daysOfWeek.includes(index);
            return (
              <Pressable
                key={day}
                style={[styles.day, { backgroundColor: selected ? theme.primary : theme.card }]}
                onPress={() => toggleDay(index)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`Select ${day}`}
              >
                <ThemedText theme={theme} style={{ color: selected ? '#FFFFFF' : theme.text }}>
                  {day}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      );
    }

    if (scheduleType === 'weekly') {
      return (
        <TextInput
          value={timesPerWeek}
          onChangeText={setTimesPerWeek}
          keyboardType="numeric"
          placeholder="3"
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          accessibilityLabel={translate('habitForm.timesPerWeek')}
        />
      );
    }

    return null;
  };

  return (
    <View>
      <ThemedText theme={theme} style={styles.label} accessibilityLabel={translate('habitForm.name')}>
        {translate('habitForm.name')}
      </ThemedText>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={translate('habitForm.name')}
        placeholderTextColor={theme.mutedText}
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        accessibilityLabel={translate('habitForm.name')}
      />

      <ThemedText theme={theme} style={styles.label}>
        {translate('habitForm.description')}
      </ThemedText>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder={translate('habitForm.description')}
        placeholderTextColor={theme.mutedText}
        style={[styles.input, styles.multilineInput, { borderColor: theme.border, color: theme.text }]}
        accessibilityLabel={translate('habitForm.description')}
        multiline
      />

      <ThemedText theme={theme} style={styles.label}>
        {translate('habitForm.color')}
      </ThemedText>
      <View style={styles.colorContainer}>
        {COLORS.map((item) => {
          const selected = item === color;
          return (
            <Pressable
              key={item}
              style={[styles.colorOption, { backgroundColor: item, borderColor: selected ? theme.text : 'transparent' }]}
              onPress={() => setColor(item)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`Select color ${item}`}
            />
          );
        })}
      </View>

      <ThemedText theme={theme} style={styles.label}>
        {translate('habitForm.schedule')}
      </ThemedText>
      <View style={styles.segmentedControl}>
        {(['daily', 'weekly', 'custom'] as ScheduleType[]).map((type) => {
          const selected = scheduleType === type;
          return (
            <Pressable
              key={type}
              onPress={() => setScheduleType(type)}
              style={[styles.segment, { backgroundColor: selected ? theme.primary : theme.card }]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`Select ${type} schedule`}
            >
              <ThemedText theme={theme} style={{ color: selected ? '#FFFFFF' : theme.text }}>
                {translate(`habitForm.${type}` as any)}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {renderScheduleControls()}

      <ThemedText theme={theme} style={styles.label}>
        {translate('habitForm.reminder')}
      </ThemedText>
      <TextInput
        value={reminderTime}
        onChangeText={setReminderTime}
        placeholder="07:00"
        placeholderTextColor={theme.mutedText}
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        accessibilityLabel={translate('habitForm.reminder')}
      />

      <Pressable
        onPress={handleSubmit}
        style={[styles.submit, { backgroundColor: theme.primary }]}
        accessibilityRole="button"
        accessibilityLabel={translate('habitForm.save')}
      >
        <ThemedText theme={theme} style={[styles.submitText, { color: '#FFFFFF' }]}>
          {translate('habitForm.save')}
        </ThemedText>
      </Pressable>

      {initialHabit && onDelete ? (
        <Pressable
          onPress={() => onDelete()}
          style={[styles.deleteButton, { borderColor: theme.danger }]}
          accessibilityRole="button"
          accessibilityLabel={translate('habitForm.delete')}
        >
          <ThemedText theme={theme} style={[styles.deleteText, { color: theme.danger }]}>
            {translate('habitForm.delete')}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500'
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  colorContainer: {
    flexDirection: 'row',
    marginBottom: 16
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 2
  },
  segmentedControl: {
    flexDirection: 'row',
    marginBottom: 12
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    marginRight: 8
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  day: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8
  },
  submit: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16
  },
  deleteText: {
    fontWeight: '600'
  }
});
