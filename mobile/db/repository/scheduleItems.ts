import type { SQLiteDatabase } from 'expo-sqlite';

import type { ServiceScheduleItem } from '../types';

export async function listScheduleItemsByCar(
  db: SQLiteDatabase,
  carId: number
): Promise<ServiceScheduleItem[]> {
  return db.getAllAsync<ServiceScheduleItem>(
    'SELECT * FROM service_schedule_items WHERE car_id = ? ORDER BY next_due_date ASC',
    carId
  );
}
