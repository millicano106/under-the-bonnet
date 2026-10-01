import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { Card, Screen, TextField } from '../components';
import { resyncAllReminderNotificationsAsync } from '../lib/notifications';
import { useSettings } from '../lib/settings';
import { colors, radii, spacing, typography } from '../theme';

const CURRENCIES = ['£', '$', '€'];
const REMINDER_HOURS = [7, 9, 12, 18];

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { settings, updateSetting } = useSettings();

  async function setRemindersEnabled(value: boolean) {
    await updateSetting('remindersEnabled', value);
    await resyncAllReminderNotificationsAsync(db);
  }

  async function setReminderHour(hour: number) {
    await updateSetting('reminderHour', hour);
    await resyncAllReminderNotificationsAsync(db);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>General</Text>
        <Card>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.chipRow}>
            {CURRENCIES.map((symbol) => (
              <Pressable
                key={symbol}
                style={[styles.chip, settings.currencySymbol === symbol && styles.chipActive]}
                onPress={() => updateSetting('currencySymbol', symbol)}
              >
                <Text style={[styles.chipText, settings.currencySymbol === symbol && styles.chipTextActive]}>
                  {symbol}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextField
            label="Your name (shown on PDF reports)"
            value={settings.ownerName}
            onChangeText={(text) => updateSetting('ownerName', text)}
            placeholder="Optional"
          />
        </Card>

        <Text style={styles.sectionTitle}>Reminders</Text>
        <Card>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchTitle}>Due-date reminders</Text>
              <Text style={styles.caption}>Notify me when a schedule item is due.</Text>
            </View>
            <Switch value={settings.remindersEnabled} onValueChange={setRemindersEnabled} />
          </View>
          {settings.remindersEnabled ? (
            <>
              <Text style={[styles.label, styles.spaced]}>Remind me at</Text>
              <View style={styles.chipRow}>
                {REMINDER_HOURS.map((hour) => (
                  <Pressable
                    key={hour}
                    style={[styles.chip, settings.reminderHour === hour && styles.chipActive]}
                    onPress={() => setReminderHour(hour)}
                  >
                    <Text style={[styles.chipText, settings.reminderHour === hour && styles.chipTextActive]}>
                      {formatHour(hour)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </Card>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchTitle}>Background artwork</Text>
              <Text style={styles.caption}>Show the decorative car backdrop on screens.</Text>
            </View>
            <Switch value={settings.showBackground} onValueChange={(v) => updateSetting('showBackground', v)} />
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.heading,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  spaced: {
    marginTop: spacing.lg,
  },
  caption: {
    ...typography.caption,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.neutralSoft,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.neutral,
  },
  chipTextActive: {
    color: colors.primary,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  switchTitle: {
    ...typography.body,
    fontWeight: '600',
  },
});
