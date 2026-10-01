import type { SQLiteDatabase } from 'expo-sqlite';

export interface AppSettings {
  currencySymbol: string;
  ownerName: string;
  remindersEnabled: boolean;
  reminderHour: number;
  showBackground: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  currencySymbol: '£',
  ownerName: '',
  remindersEnabled: true,
  reminderHour: 9,
  showBackground: true,
};

export async function loadSettings(db: SQLiteDatabase): Promise<AppSettings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const stored = new Map(rows.map((row) => [row.key, row.value]));
  const hour = Number(stored.get('reminderHour'));
  return {
    currencySymbol: stored.get('currencySymbol') ?? DEFAULT_SETTINGS.currencySymbol,
    ownerName: stored.get('ownerName') ?? DEFAULT_SETTINGS.ownerName,
    remindersEnabled: stored.has('remindersEnabled')
      ? stored.get('remindersEnabled') === '1'
      : DEFAULT_SETTINGS.remindersEnabled,
    reminderHour:
      stored.has('reminderHour') && Number.isInteger(hour) && hour >= 0 && hour <= 23
        ? hour
        : DEFAULT_SETTINGS.reminderHour,
    showBackground: stored.has('showBackground')
      ? stored.get('showBackground') === '1'
      : DEFAULT_SETTINGS.showBackground,
  };
}

export async function saveSetting<K extends keyof AppSettings>(
  db: SQLiteDatabase,
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const serialised = typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    serialised
  );
}
