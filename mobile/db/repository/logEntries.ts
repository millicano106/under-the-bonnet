import type { SQLiteDatabase } from 'expo-sqlite';

import type { LogEntry, LogEntryType } from '../types';

export interface NewLogEntryInput {
  car_id: number;
  entry_type: LogEntryType;
  title: string;
  description?: string | null;
  cost?: number | null;
  mileage_at_entry?: number | null;
  date: string;
}

export interface UpdateLogEntryInput {
  entry_type: LogEntryType;
  title: string;
  description?: string | null;
  cost?: number | null;
  mileage_at_entry?: number | null;
  date: string;
}

export async function listLogEntriesByCar(db: SQLiteDatabase, carId: number): Promise<LogEntry[]> {
  return db.getAllAsync<LogEntry>(
    'SELECT * FROM log_entries WHERE car_id = ? ORDER BY date DESC',
    carId
  );
}

export async function getLogEntryById(db: SQLiteDatabase, id: number): Promise<LogEntry | null> {
  const entry = await db.getFirstAsync<LogEntry>('SELECT * FROM log_entries WHERE id = ?', id);
  return entry ?? null;
}

export async function createLogEntry(db: SQLiteDatabase, input: NewLogEntryInput): Promise<LogEntry> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO log_entries
      (car_id, entry_type, title, description, cost, mileage_at_entry, date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.car_id,
    input.entry_type,
    input.title,
    input.description ?? null,
    input.cost ?? null,
    input.mileage_at_entry ?? null,
    input.date,
    now,
    now
  );

  const entry = await getLogEntryById(db, result.lastInsertRowId);
  if (!entry) throw new Error('Failed to load log entry after insert');
  return entry;
}

export async function updateLogEntry(
  db: SQLiteDatabase,
  id: number,
  input: UpdateLogEntryInput
): Promise<void> {
  await db.runAsync(
    `UPDATE log_entries
     SET entry_type = ?, title = ?, description = ?, cost = ?, mileage_at_entry = ?, date = ?, updated_at = ?
     WHERE id = ?`,
    input.entry_type,
    input.title,
    input.description ?? null,
    input.cost ?? null,
    input.mileage_at_entry ?? null,
    input.date,
    new Date().toISOString(),
    id
  );
}

export async function deleteLogEntry(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM log_entries WHERE id = ?', id);
}
