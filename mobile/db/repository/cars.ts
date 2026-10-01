import type { SQLiteDatabase } from 'expo-sqlite';

import type { Car } from '../types';

export interface NewCarInput {
  name: string;
  make: string;
  model: string;
  year: number;
  registration: string;
  colour?: string | null;
  purchase_price: number;
  purchase_date: string;
  photo_uri?: string | null;
}

export interface MarkCarSoldInput {
  sale_price: number;
  sale_date: string;
}

export async function listCars(db: SQLiteDatabase): Promise<Car[]> {
  return db.getAllAsync<Car>('SELECT * FROM cars ORDER BY is_sold ASC, created_at DESC');
}

export async function getCarById(db: SQLiteDatabase, id: number): Promise<Car | null> {
  const car = await db.getFirstAsync<Car>('SELECT * FROM cars WHERE id = ?', id);
  return car ?? null;
}

export async function createCar(db: SQLiteDatabase, input: NewCarInput): Promise<Car> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO cars
      (name, make, model, year, registration, colour, purchase_price, purchase_date, photo_uri, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.name,
    input.make,
    input.model,
    input.year,
    input.registration,
    input.colour ?? null,
    input.purchase_price,
    input.purchase_date,
    input.photo_uri ?? null,
    now,
    now
  );

  const car = await getCarById(db, result.lastInsertRowId);
  if (!car) throw new Error('Failed to load car after insert');
  return car;
}

export async function markCarSold(
  db: SQLiteDatabase,
  id: number,
  input: MarkCarSoldInput
): Promise<void> {
  await db.runAsync(
    `UPDATE cars SET is_sold = 1, sale_price = ?, sale_date = ?, updated_at = ? WHERE id = ?`,
    input.sale_price,
    input.sale_date,
    new Date().toISOString(),
    id
  );
}

export async function reopenCar(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync(
    `UPDATE cars SET is_sold = 0, sale_price = NULL, sale_date = NULL, updated_at = ? WHERE id = ?`,
    new Date().toISOString(),
    id
  );
}

// Child rows (components, schedule items, log entries, reminders, invoice
// photos) are removed by ON DELETE CASCADE. Callers are responsible for
// cancelling OS notifications and deleting photo files first.
export async function deleteCar(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM cars WHERE id = ?', id);
}
