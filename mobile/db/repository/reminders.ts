import type { SQLiteDatabase } from 'expo-sqlite';

import type { Reminder, ReminderSourceType } from '../types';

export interface UpsertReminderInput {
  car_id: number;
  source_type: ReminderSourceType;
  source_id: number;
  due_date: string;
}

export async function listRemindersByCar(db: SQLiteDatabase, carId: number): Promise<Reminder[]> {
  return db.getAllAsync<Reminder>('SELECT * FROM reminders WHERE car_id = ?', carId);
}

export async function getReminderBySource(
  db: SQLiteDatabase,
  sourceType: ReminderSourceType,
  sourceId: number
): Promise<Reminder | null> {
  const reminder = await db.getFirstAsync<Reminder>(
    'SELECT * FROM reminders WHERE source_type = ? AND source_id = ?',
    sourceType,
    sourceId
  );
  return reminder ?? null;
}

export async function upsertReminderForSource(
  db: SQLiteDatabase,
  input: UpsertReminderInput
): Promise<Reminder> {
  const existing = await getReminderBySource(db, input.source_type, input.source_id);

  if (existing) {
    await db.runAsync(
      'UPDATE reminders SET due_date = ?, is_dismissed = 0 WHERE id = ?',
      input.due_date,
      existing.id
    );
    const updated = await db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', existing.id);
    if (!updated) throw new Error('Failed to load reminder after update');
    return updated;
  }

  const result = await db.runAsync(
    `INSERT INTO reminders (car_id, source_type, source_id, due_date, is_dismissed, created_at)
     VALUES (?, ?, ?, ?, 0, ?)`,
    input.car_id,
    input.source_type,
    input.source_id,
    input.due_date,
    new Date().toISOString()
  );
  const created = await db.getFirstAsync<Reminder>(
    'SELECT * FROM reminders WHERE id = ?',
    result.lastInsertRowId
  );
  if (!created) throw new Error('Failed to load reminder after insert');
  return created;
}

export async function setReminderNotificationId(
  db: SQLiteDatabase,
  id: number,
  notificationId: string | null
): Promise<void> {
  await db.runAsync('UPDATE reminders SET notification_id = ? WHERE id = ?', notificationId, id);
}

export async function deleteReminderBySource(
  db: SQLiteDatabase,
  sourceType: ReminderSourceType,
  sourceId: number
): Promise<void> {
  await db.runAsync(
    'DELETE FROM reminders WHERE source_type = ? AND source_id = ?',
    sourceType,
    sourceId
  );
}

export async function dismissReminder(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('UPDATE reminders SET is_dismissed = 1 WHERE id = ?', id);
}
