import type { Migration } from './types';

export const migration003AddInvoicePhotos: Migration = {
  version: 3,
  name: 'add_invoice_photos',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE invoice_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        log_entry_id INTEGER NOT NULL REFERENCES log_entries(id) ON DELETE CASCADE,
        uri TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX idx_invoice_photos_car_id ON invoice_photos(car_id);
      CREATE INDEX idx_invoice_photos_log_entry_id ON invoice_photos(log_entry_id);
    `);
  },
};
