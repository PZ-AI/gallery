import React, { useEffect, useMemo } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import { HabitForm } from '@/components/forms/HabitForm';
import { useHabitStore } from '@/store/useHabitStore';
import { getTheme } from '@/styles/theme';
import { RootStackParamList } from '@/navigation/types';
import { ThemedView } from '@/components/layout/ThemedView';
import { translate } from '@/i18n';
import { HabitInput } from '@/types';

export type HabitFormScreenProps = NativeStackScreenProps<RootStackParamList, 'HabitForm'>;

export const HabitFormScreen: React.FC<HabitFormScreenProps> = ({ route, navigation }) => {
  const { habitId } = route.params ?? {};
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const { habits, addHabit, editHabit, removeHabit } = useHabitStore();
  const habit = useMemo(() => habits.find((item) => item.id === habitId), [habits, habitId]);

  useEffect(() => {
    navigation.setOptions({ title: habit ? translate('habitForm.titleEdit') : translate('habitForm.titleNew') });
  }, [habit, navigation]);

  const handleSubmit = async (payload: HabitInput & { id?: string }) => {
    if (habit) {
      await editHabit({ ...habit, ...payload });
    } else {
      await addHabit(payload);
    }
    navigation.goBack();
  };

  const handleDelete = async () => {
    if (!habit) return;
    Alert.alert(translate('common.delete'), translate('habitForm.deleteConfirm'), [
      { text: translate('common.cancel'), style: 'cancel' },
      {
        text: translate('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await removeHabit(habit.id);
          navigation.popToTop();
        }
      }
    ]);
  };

  return (
    <ThemedView theme={theme}>
      <ScrollView contentContainerStyle={styles.container}>
        <HabitForm
          initialHabit={habit}
          theme={theme}
          onSubmit={handleSubmit}
          onDelete={habit ? handleDelete : undefined}
        />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32
  }
});
