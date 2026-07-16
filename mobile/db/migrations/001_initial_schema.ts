import type { Migration } from './types';

export const migration001InitialSchema: Migration = {
  version: 1,
  name: 'initial_schema',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE cars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        year INTEGER NOT NULL,
        registration TEXT NOT NULL,
        colour TEXT,
        purchase_price REAL NOT NULL,
        purchase_date TEXT NOT NULL,
        sale_price REAL,
        sale_date TEXT,
        is_sold INTEGER NOT NULL DEFAULT 0,
        photo_uri TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        installed_date TEXT,
        installed_mileage INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX idx_components_car_id ON components(car_id);

      CREATE TABLE service_schedule_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        interval_miles INTEGER,
        interval_months INTEGER,
        last_done_date TEXT,
        last_done_mileage INTEGER,
        next_due_date TEXT,
        next_due_mileage INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX idx_service_schedule_items_car_id ON service_schedule_items(car_id);

      CREATE TABLE log_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        entry_type TEXT NOT NULL CHECK (entry_type IN ('service', 'note', 'cost', 'fuel')),
        title TEXT NOT NULL,
        description TEXT,
        cost REAL,
        mileage_at_entry INTEGER,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX idx_log_entries_car_id ON log_entries(car_id);

      CREATE TABLE reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
        source_type TEXT NOT NULL CHECK (source_type IN ('service_schedule', 'mot', 'tax', 'insurance')),
        source_id INTEGER REFERENCES service_schedule_items(id) ON DELETE CASCADE,
        due_date TEXT NOT NULL,
        is_dismissed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX idx_reminders_car_id ON reminders(car_id);
    `);
  },
};
