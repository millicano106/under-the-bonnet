import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button, Card, TextField } from '../components';
import { createLogEntry, getLogEntryById, updateLogEntry } from '../db/repository/logEntries';
import type { LogEntryType } from '../db/types';
import { parseOptionalNumber, parseOptionalText, todayIsoDate } from '../lib/formValues';
import { colors, radii, spacing, typography } from '../theme';

const ENTRY_TYPES: { key: LogEntryType; label: string }[] = [
  { key: 'service', label: 'Service' },
  { key: 'note', label: 'Note' },
  { key: 'cost', label: 'Cost' },
  { key: 'fuel', label: 'Fuel' },
];

export default function LogEntryFormScreen() {
  const { carId, id } = useLocalSearchParams<{ carId: string; id?: string }>();
  const db = useSQLiteContext();
  const isEditing = Boolean(id);

  const [entryType, setEntryType] = useState<LogEntryType>('note');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [mileageAtEntry, setMileageAtEntry] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [loaded, setLoaded] = useState(!isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getLogEntryById(db, Number(id)).then((entry) => {
      if (!entry) return;
      setEntryType(entry.entry_type);
      setTitle(entry.title);
      setDescription(entry.description ?? '');
      setCost(entry.cost != null ? String(entry.cost) : '');
      setMileageAtEntry(entry.mileage_at_entry != null ? String(entry.mileage_at_entry) : '');
      setDate(entry.date);
      setLoaded(true);
    });
  }, [db, id]);

  const canSubmit = title.trim().length > 0 && date.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const input = {
        entry_type: entryType,
        title: title.trim(),
        description: parseOptionalText(description),
        cost: parseOptionalNumber(cost),
        mileage_at_entry: parseOptionalNumber(mileageAtEntry),
        date: date.trim(),
      };
      if (isEditing) {
        await updateLogEntry(db, Number(id), input);
      } else {
        await createLogEntry(db, { car_id: Number(carId), ...input });
      }
      router.back();
    } catch (error) {
      Alert.alert('Could not save log entry', error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (!loaded) {
    return (
      <View style={styles.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: isEditing ? 'Edit Log Entry' : 'Add Log Entry' }} />
      <Card>
        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          {ENTRY_TYPES.map((type) => (
            <Pressable
              key={type.key}
              style={[styles.chip, entryType === type.key && styles.chipActive]}
              onPress={() => setEntryType(type.key)}
            >
              <Text style={[styles.chipText, entryType === type.key && styles.chipTextActive]}>
                {type.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextField label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Full service" />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional notes"
          multiline
        />
        <TextField
          label="Cost"
          value={cost}
          onChangeText={setCost}
          placeholder="e.g. 150"
          keyboardType="decimal-pad"
        />
        <TextField
          label="Mileage at entry"
          value={mileageAtEntry}
          onChangeText={setMileageAtEntry}
          placeholder="e.g. 38000"
          keyboardType="number-pad"
        />
        <TextField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      </Card>

      <Button
        title={submitting ? 'Saving…' : 'Save Log Entry'}
        onPress={handleSubmit}
        disabled={!canSubmit}
        loading={submitting}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
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
  submitButton: {
    marginTop: spacing.lg,
  },
});
