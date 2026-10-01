import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { DATABASE_NAME } from '../db/client';
import { migrateDbIfNeeded } from '../db/migrate';
import { ensureNotificationPermissionsAsync } from '../lib/notifications';
import { SettingsProvider } from '../lib/settings';
import { colors } from '../theme';

export default function RootLayout() {
  useEffect(() => {
    ensureNotificationPermissionsAsync();
  }, []);

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
      <SettingsProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.primarySoft },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Garage' }} />
          <Stack.Screen name="add-car" options={{ title: 'Add Car', presentation: 'modal' }} />
          <Stack.Screen name="car/[id]" options={{ title: 'Car Detail' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="component-form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="schedule-item-form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="log-entry-form" options={{ presentation: 'modal' }} />
        </Stack>
      </SettingsProvider>
    </SQLiteProvider>
  );
}
