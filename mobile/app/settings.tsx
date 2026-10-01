import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Feather } from '@expo/vector-icons';

import { Card, Screen, TextField } from '../components';
import { useAccent } from '../lib/accent';
import { resyncAllReminderNotificationsAsync } from '../lib/notifications';
import { useSettings } from '../lib/settings';
import { colors, fonts, PAINTS, radii, spacing, TOUCH_TARGET, typography } from '../theme';

const CURRENCIES = ['£', '$', '€'];
const REMINDER_HOURS = [7, 9, 12, 18];
const SWATCH_SIZE = 44;

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, '0')}:00`;
}

function Chip(props: { label: string; selected: boolean; onPress: () => void }) {
  const accent = useAccent();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: props.selected }}
      style={[styles.chip, props.selected && { backgroundColor: accent.fill }]}
      onPress={props.onPress}
    >
      <Text style={[styles.chipText, props.selected && { color: accent.on }]}>{props.label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const accent = useAccent();
  const { settings, updateSetting } = useSettings();

  async function setRemindersEnabled(value: boolean) {
    await updateSetting('remindersEnabled', value);
    await resyncAllReminderNotificationsAsync(db);
  }

  async function setReminderHour(hour: number) {
    await updateSetting('reminderHour', hour);
    await resyncAllReminderNotificationsAsync(db);
  }

  const switchColors = { false: colors.controlBorder, true: accent.fill };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Appearance</Text>
        <Card>
          <Text style={styles.label}>Accent colour</Text>
          <View style={styles.swatchGrid} accessibilityRole="radiogroup">
            {PAINTS.map((paint) => {
              const selected = settings.accentPaint === paint.name;
              return (
                <Pressable
                  key={paint.name}
                  style={styles.swatchCell}
                  onPress={() => updateSetting('accentPaint', paint.name)}
                  accessibilityRole="radio"
                  accessibilityLabel={paint.name}
                  accessibilityState={{ selected }}
                >
                  {/* Selected: 2px ring in the paint colour, then a 3px white gap. */}
                  <View style={[styles.swatchRing, selected && { borderColor: paint.fill }]}>
                    <View style={[styles.swatch, { backgroundColor: paint.fill }]}>
                      {selected ? <Feather name="check" size={20} color={paint.on} /> : null}
                    </View>
                  </View>
                  <Text style={[styles.swatchName, selected && styles.swatchNameSelected]} numberOfLines={2}>
                    {paint.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchTitle}>Background artwork</Text>
              <Text style={styles.caption}>Dot grid behind each screen.</Text>
            </View>
            <Switch
              accessibilityRole="switch"
              accessibilityLabel="Background artwork"
              value={settings.showBackground}
              onValueChange={(value) => updateSetting('showBackground', value)}
              trackColor={switchColors}
              thumbColor={colors.white}
            />
          </View>

          {settings.showBackground ? (
            <View style={[styles.switchRow, styles.switchRowSpaced]}>
              <View style={styles.switchText}>
                <Text style={styles.switchTitle}>Chequered flag</Text>
                <Text style={styles.caption}>Fades in from the top-right corner</Text>
              </View>
              <Switch
                accessibilityRole="switch"
                accessibilityLabel="Chequered flag"
                value={settings.showChequeredFlag}
                onValueChange={(value) => updateSetting('showChequeredFlag', value)}
                trackColor={switchColors}
                thumbColor={colors.white}
              />
            </View>
          ) : null}
        </Card>

        <Text style={styles.sectionTitle}>Reports</Text>
        <Card>
          <Text style={styles.label}>Currency</Text>
          <View style={styles.chipRow} accessibilityRole="radiogroup">
            {CURRENCIES.map((symbol) => (
              <Chip
                key={symbol}
                label={symbol}
                selected={settings.currencySymbol === symbol}
                onPress={() => updateSetting('currencySymbol', symbol)}
              />
            ))}
          </View>
          <TextField
            label="Name for reports"
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
            <Switch
              accessibilityRole="switch"
              accessibilityLabel="Due-date reminders"
              value={settings.remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={switchColors}
              thumbColor={colors.white}
            />
          </View>
          {settings.remindersEnabled ? (
            <>
              <Text style={[styles.label, styles.spaced]}>Remind me at</Text>
              <View style={styles.chipRow} accessibilityRole="radiogroup">
                {REMINDER_HOURS.map((hour) => (
                  <Chip
                    key={hour}
                    label={formatHour(hour)}
                    selected={settings.reminderHour === hour}
                    onPress={() => setReminderHour(hour)}
                  />
                ))}
              </View>
            </>
          ) : null}
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
    ...typography.label,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  spaced: {
    marginTop: spacing.lg,
  },
  caption: {
    ...typography.caption,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  swatchCell: {
    width: '33.333%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  // 44px swatch + 3px white gap + 2px ring = 54px.
  swatchRing: {
    width: SWATCH_SIZE + 10,
    height: SWATCH_SIZE + 10,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 3,
    backgroundColor: colors.surface,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchName: {
    ...typography.caption,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  swatchNameSelected: {
    fontFamily: fonts.semibold,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    minHeight: TOUCH_TARGET,
    minWidth: TOUCH_TARGET,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.chipBg,
  },
  chipText: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.chipText,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TOUCH_TARGET,
  },
  switchRowSpaced: {
    marginTop: spacing.sm,
  },
  switchText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  switchTitle: {
    ...typography.rowTitle,
  },
});
