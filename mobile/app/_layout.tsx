import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';

import { DATABASE_NAME } from '../db/client';
import { migrateDbIfNeeded } from '../db/migrate';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Garage' }} />
        <Stack.Screen name="add-car" options={{ title: 'Add Car', presentation: 'modal' }} />
        <Stack.Screen name="car/[id]" options={{ title: 'Car Detail' }} />
      </Stack>
    </SQLiteProvider>
  );
}
