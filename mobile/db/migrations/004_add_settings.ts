import type { Migration } from './types';

export const migration004AddSettings: Migration = {
  version: 4,
  name: 'add_settings',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  },
};
