import type { SQLiteDatabase } from 'expo-sqlite';

import type { LogEntry } from '../types';

export async function listLogEntriesByCar(db: SQLiteDatabase, carId: number): Promise<LogEntry[]> {
  return db.getAllAsync<LogEntry>(
    'SELECT * FROM log_entries WHERE car_id = ? ORDER BY date DESC',
    carId
  );
}
