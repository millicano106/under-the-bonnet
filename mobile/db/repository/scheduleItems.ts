import type { SQLiteDatabase } from 'expo-sqlite';

import type { ServiceScheduleItem } from '../types';

export interface NewScheduleItemInput {
  car_id: number;
  name: string;
  description?: string | null;
  interval_miles?: number | null;
  interval_months?: number | null;
  last_done_date?: string | null;
  last_done_mileage?: number | null;
  next_due_date?: string | null;
  next_due_mileage?: number | null;
}

export interface UpdateScheduleItemInput {
  name: string;
  description?: string | null;
  interval_miles?: number | null;
  interval_months?: number | null;
  last_done_date?: string | null;
  last_done_mileage?: number | null;
  next_due_date?: string | null;
  next_due_mileage?: number | null;
}

export async function listScheduleItemsByCar(
  db: SQLiteDatabase,
  carId: number
): Promise<ServiceScheduleItem[]> {
  return db.getAllAsync<ServiceScheduleItem>(
    'SELECT * FROM service_schedule_items WHERE car_id = ? ORDER BY next_due_date ASC',
    carId
  );
}

export async function getScheduleItemById(
  db: SQLiteDatabase,
  id: number
): Promise<ServiceScheduleItem | null> {
  const item = await db.getFirstAsync<ServiceScheduleItem>(
    'SELECT * FROM service_schedule_items WHERE id = ?',
    id
  );
  return item ?? null;
}

export async function createScheduleItem(
  db: SQLiteDatabase,
  input: NewScheduleItemInput
): Promise<ServiceScheduleItem> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO service_schedule_items
      (car_id, name, description, interval_miles, interval_months, last_done_date,
       last_done_mileage, next_due_date, next_due_mileage, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.car_id,
    input.name,
    input.description ?? null,
    input.interval_miles ?? null,
    input.interval_months ?? null,
    input.last_done_date ?? null,
    input.last_done_mileage ?? null,
    input.next_due_date ?? null,
    input.next_due_mileage ?? null,
    now,
    now
  );

  const item = await getScheduleItemById(db, result.lastInsertRowId);
  if (!item) throw new Error('Failed to load schedule item after insert');
  return item;
}

export async function updateScheduleItem(
  db: SQLiteDatabase,
  id: number,
  input: UpdateScheduleItemInput
): Promise<void> {
  await db.runAsync(
    `UPDATE service_schedule_items
     SET name = ?, description = ?, interval_miles = ?, interval_months = ?, last_done_date = ?,
         last_done_mileage = ?, next_due_date = ?, next_due_mileage = ?, updated_at = ?
     WHERE id = ?`,
    input.name,
    input.description ?? null,
    input.interval_miles ?? null,
    input.interval_months ?? null,
    input.last_done_date ?? null,
    input.last_done_mileage ?? null,
    input.next_due_date ?? null,
    input.next_due_mileage ?? null,
    new Date().toISOString(),
    id
  );
}

export async function deleteScheduleItem(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM service_schedule_items WHERE id = ?', id);
}
