import type { SQLiteDatabase } from 'expo-sqlite';

import type { InvoicePhoto } from '../types';

export async function listInvoicePhotosByLogEntry(
  db: SQLiteDatabase,
  logEntryId: number
): Promise<InvoicePhoto[]> {
  return db.getAllAsync<InvoicePhoto>(
    'SELECT * FROM invoice_photos WHERE log_entry_id = ? ORDER BY id ASC',
    logEntryId
  );
}

export async function listInvoicePhotosByCar(db: SQLiteDatabase, carId: number): Promise<InvoicePhoto[]> {
  return db.getAllAsync<InvoicePhoto>(
    'SELECT * FROM invoice_photos WHERE car_id = ? ORDER BY id ASC',
    carId
  );
}

export async function addInvoicePhoto(
  db: SQLiteDatabase,
  input: { car_id: number; log_entry_id: number; uri: string }
): Promise<void> {
  await db.runAsync(
    'INSERT INTO invoice_photos (car_id, log_entry_id, uri, created_at) VALUES (?, ?, ?, ?)',
    input.car_id,
    input.log_entry_id,
    input.uri,
    new Date().toISOString()
  );
}

export async function deleteInvoicePhoto(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM invoice_photos WHERE id = ?', id);
}
