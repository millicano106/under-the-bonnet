import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import {
  deleteReminderBySource,
  getReminderBySource,
  setReminderNotificationId,
  upsertReminderForSource,
} from '../db/repository/reminders';
import type { ServiceScheduleItem } from '../db/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REMINDER_HOUR = 9;

export async function ensureNotificationPermissionsAsync(): Promise<boolean> {
  try {
    if (!Device.isDevice) return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === 'granted') return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleReminderNotificationAsync(content: {
  title: string;
  body: string;
  dueDateIso: string;
}): Promise<string | null> {
  try {
    const fireDate = new Date(`${content.dueDateIso}T${String(REMINDER_HOUR).padStart(2, '0')}:00:00`);
    if (Number.isNaN(fireDate.getTime()) || fireDate.getTime() <= Date.now()) return null;

    return await Notifications.scheduleNotificationAsync({
      content: { title: content.title, body: content.body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireDate },
    });
  } catch {
    return null;
  }
}

export async function cancelReminderNotificationAsync(
  notificationId: string | null | undefined
): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Already fired or cancelled — nothing to do.
  }
}

export async function syncReminderNotificationAsync(
  db: SQLiteDatabase,
  scheduleItem: Pick<ServiceScheduleItem, 'id' | 'car_id' | 'name' | 'next_due_date'>
): Promise<void> {
  const existing = await getReminderBySource(db, 'service_schedule', scheduleItem.id);
  await cancelReminderNotificationAsync(existing?.notification_id);

  if (!scheduleItem.next_due_date) {
    await deleteReminderBySource(db, 'service_schedule', scheduleItem.id);
    return;
  }

  const reminder = await upsertReminderForSource(db, {
    car_id: scheduleItem.car_id,
    source_type: 'service_schedule',
    source_id: scheduleItem.id,
    due_date: scheduleItem.next_due_date,
  });

  const notificationId = await scheduleReminderNotificationAsync({
    title: `${scheduleItem.name} is due`,
    body: `Due ${scheduleItem.next_due_date}`,
    dueDateIso: scheduleItem.next_due_date,
  });

  await setReminderNotificationId(db, reminder.id, notificationId);
}

export async function cancelReminderNotificationForScheduleItemAsync(
  db: SQLiteDatabase,
  scheduleItemId: number
): Promise<void> {
  const existing = await getReminderBySource(db, 'service_schedule', scheduleItemId);
  await cancelReminderNotificationAsync(existing?.notification_id);
}
