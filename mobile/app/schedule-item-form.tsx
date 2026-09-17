import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button, Card, TextField } from '../components';
import {
  createScheduleItem,
  getScheduleItemById,
  updateScheduleItem,
} from '../db/repository/scheduleItems';
import { syncReminderNotificationAsync } from '../lib/notifications';
import { parseOptionalNumber, parseOptionalText } from '../lib/formValues';
import { spacing } from '../theme';

export default function ScheduleItemFormScreen() {
  const { carId, id } = useLocalSearchParams<{ carId: string; id?: string }>();
  const db = useSQLiteContext();
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [intervalMiles, setIntervalMiles] = useState('');
  const [intervalMonths, setIntervalMonths] = useState('');
  const [lastDoneDate, setLastDoneDate] = useState('');
  const [lastDoneMileage, setLastDoneMileage] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [nextDueMileage, setNextDueMileage] = useState('');
  const [loaded, setLoaded] = useState(!isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getScheduleItemById(db, Number(id)).then((item) => {
      if (!item) return;
      setName(item.name);
      setDescription(item.description ?? '');
      setIntervalMiles(item.interval_miles != null ? String(item.interval_miles) : '');
      setIntervalMonths(item.interval_months != null ? String(item.interval_months) : '');
      setLastDoneDate(item.last_done_date ?? '');
      setLastDoneMileage(item.last_done_mileage != null ? String(item.last_done_mileage) : '');
      setNextDueDate(item.next_due_date ?? '');
      setNextDueMileage(item.next_due_mileage != null ? String(item.next_due_mileage) : '');
      setLoaded(true);
    });
  }, [db, id]);

  const canSubmit = name.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const input = {
        name: name.trim(),
        description: parseOptionalText(description),
        interval_miles: parseOptionalNumber(intervalMiles),
        interval_months: parseOptionalNumber(intervalMonths),
        last_done_date: parseOptionalText(lastDoneDate),
        last_done_mileage: parseOptionalNumber(lastDoneMileage),
        next_due_date: parseOptionalText(nextDueDate),
        next_due_mileage: parseOptionalNumber(nextDueMileage),
      };

      const numericCarId = Number(carId);
      const savedId = isEditing
        ? Number(id)
        : (await createScheduleItem(db, { car_id: numericCarId, ...input })).id;
      if (isEditing) {
        await updateScheduleItem(db, savedId, input);
      }

      await syncReminderNotificationAsync(db, {
        id: savedId,
        car_id: numericCarId,
        name: input.name,
        next_due_date: input.next_due_date,
      });

      router.back();
    } catch (error) {
      Alert.alert(
        'Could not save schedule item',
        error instanceof Error ? error.message : String(error)
      );
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
      <Stack.Screen options={{ title: isEditing ? 'Edit Schedule Item' : 'Add Schedule Item' }} />
      <Card>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Oil change" />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional notes"
          multiline
        />
        <TextField
          label="Interval (miles)"
          value={intervalMiles}
          onChangeText={setIntervalMiles}
          placeholder="e.g. 10000"
          keyboardType="number-pad"
        />
        <TextField
          label="Interval (months)"
          value={intervalMonths}
          onChangeText={setIntervalMonths}
          placeholder="e.g. 12"
          keyboardType="number-pad"
        />
        <TextField
          label="Last done date"
          value={lastDoneDate}
          onChangeText={setLastDoneDate}
          placeholder="YYYY-MM-DD"
        />
        <TextField
          label="Last done mileage"
          value={lastDoneMileage}
          onChangeText={setLastDoneMileage}
          placeholder="e.g. 32000"
          keyboardType="number-pad"
        />
        <TextField
          label="Next due date"
          value={nextDueDate}
          onChangeText={setNextDueDate}
          placeholder="YYYY-MM-DD — sets a reminder"
        />
        <TextField
          label="Next due mileage"
          value={nextDueMileage}
          onChangeText={setNextDueMileage}
          placeholder="e.g. 42000"
          keyboardType="number-pad"
        />
      </Card>

      <Button
        title={submitting ? 'Saving…' : 'Save Schedule Item'}
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
  submitButton: {
    marginTop: spacing.lg,
  },
});
