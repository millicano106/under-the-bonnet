import type { Migration } from './types';

export const migration002AddReminderNotificationId: Migration = {
  version: 2,
  name: 'add_reminder_notification_id',
  up: async (db) => {
    await db.execAsync(`ALTER TABLE reminders ADD COLUMN notification_id TEXT;`);
  },
};
