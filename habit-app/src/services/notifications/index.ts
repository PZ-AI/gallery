import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { NotificationTriggerInput } from 'expo-notifications';
import { Habit } from '@/types';
import { clearHabitNotifications, saveHabitNotification } from '@/services/database';
import { translate } from '@/i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldSetBadge: true,
    shouldPlaySound: true
  })
});

export const initializeNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default'
    });
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const permission = await Notifications.requestPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert(translate('notifications.permissionDenied'));
    }
  }
};

export const scheduleHabitNotifications = async (habit: Habit) => {
  await clearHabitNotifications(habit.id);
  if (!habit.reminderTime) {
    return;
  }

  const [hour, minute] = habit.reminderTime.split(':').map(Number);

  const createNotification = async (trigger: NotificationTriggerInput) => {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: habit.name,
        body: habit.description || 'Time to complete your habit!',
        sound: 'default'
      },
      trigger
    });
    await saveHabitNotification(habit.id, notificationId);
  };

  if (habit.schedule.type === 'custom' && habit.schedule.daysOfWeek?.length) {
    for (const day of habit.schedule.daysOfWeek) {
      await createNotification({
        channelId: 'habit-reminders',
        hour,
        minute,
        weekday: day === 0 ? 1 : day + 1,
        repeats: true
      });
    }
    return;
  }

  await createNotification({
    channelId: 'habit-reminders',
    hour,
    minute,
    repeats: true
  });
};

export const cancelHabitNotifications = async (notificationIds: string[]) => {
  for (const id of notificationIds) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }
};
