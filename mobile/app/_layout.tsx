import { useEffect } from 'react';
import {
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';
import {
  IBMPlexSans_400Regular,
  IBMPlexSans_500Medium,
  IBMPlexSans_600SemiBold,
} from '@expo-google-fonts/ibm-plex-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';

import { DATABASE_NAME } from '../db/client';
import { migrateDbIfNeeded } from '../db/migrate';
import { ensureNotificationPermissionsAsync } from '../lib/notifications';
import { SettingsProvider } from '../lib/settings';
import { colors, fonts } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    IBMPlexSans_600SemiBold,
    IBMPlexMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    ensureNotificationPermissionsAsync();
  }, []);

  // Hold the splash screen until fonts are ready (or have failed to load, in
  // which case the app falls back to system fonts).
  if (!fontsLoaded && !fontError) return null;

  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
      <SettingsProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.primary,
            headerTitleStyle: { color: colors.textPrimary, fontFamily: fonts.semibold },
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
