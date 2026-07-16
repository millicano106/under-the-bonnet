import type { SQLiteDatabase } from 'expo-sqlite';

import type { Component } from '../types';

export async function listComponentsByCar(db: SQLiteDatabase, carId: number): Promise<Component[]> {
  return db.getAllAsync<Component>(
    'SELECT * FROM components WHERE car_id = ? ORDER BY installed_date DESC',
    carId
  );
}
