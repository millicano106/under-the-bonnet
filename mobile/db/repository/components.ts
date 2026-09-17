import type { SQLiteDatabase } from 'expo-sqlite';

import type { Component } from '../types';

export interface NewComponentInput {
  car_id: number;
  name: string;
  category: string;
  installed_date?: string | null;
  installed_mileage?: number | null;
}

export interface UpdateComponentInput {
  name: string;
  category: string;
  installed_date?: string | null;
  installed_mileage?: number | null;
}

export async function listComponentsByCar(db: SQLiteDatabase, carId: number): Promise<Component[]> {
  return db.getAllAsync<Component>(
    'SELECT * FROM components WHERE car_id = ? ORDER BY installed_date DESC',
    carId
  );
}

export async function getComponentById(db: SQLiteDatabase, id: number): Promise<Component | null> {
  const component = await db.getFirstAsync<Component>('SELECT * FROM components WHERE id = ?', id);
  return component ?? null;
}

export async function createComponent(
  db: SQLiteDatabase,
  input: NewComponentInput
): Promise<Component> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO components
      (car_id, name, category, installed_date, installed_mileage, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    input.car_id,
    input.name,
    input.category,
    input.installed_date ?? null,
    input.installed_mileage ?? null,
    now,
    now
  );

  const component = await getComponentById(db, result.lastInsertRowId);
  if (!component) throw new Error('Failed to load component after insert');
  return component;
}

export async function updateComponent(
  db: SQLiteDatabase,
  id: number,
  input: UpdateComponentInput
): Promise<void> {
  await db.runAsync(
    `UPDATE components
     SET name = ?, category = ?, installed_date = ?, installed_mileage = ?, updated_at = ?
     WHERE id = ?`,
    input.name,
    input.category,
    input.installed_date ?? null,
    input.installed_mileage ?? null,
    new Date().toISOString(),
    id
  );
}

export async function deleteComponent(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM components WHERE id = ?', id);
}
