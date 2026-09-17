import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button, Card, TextField } from '../components';
import {
  createComponent,
  getComponentById,
  updateComponent,
} from '../db/repository/components';
import { parseOptionalNumber, parseOptionalText } from '../lib/formValues';
import { spacing } from '../theme';

export default function ComponentFormScreen() {
  const { carId, id } = useLocalSearchParams<{ carId: string; id?: string }>();
  const db = useSQLiteContext();
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [installedDate, setInstalledDate] = useState('');
  const [installedMileage, setInstalledMileage] = useState('');
  const [loaded, setLoaded] = useState(!isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getComponentById(db, Number(id)).then((component) => {
      if (!component) return;
      setName(component.name);
      setCategory(component.category);
      setInstalledDate(component.installed_date ?? '');
      setInstalledMileage(component.installed_mileage != null ? String(component.installed_mileage) : '');
      setLoaded(true);
    });
  }, [db, id]);

  const canSubmit = name.trim().length > 0 && category.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const input = {
        name: name.trim(),
        category: category.trim(),
        installed_date: parseOptionalText(installedDate),
        installed_mileage: parseOptionalNumber(installedMileage),
      };
      if (isEditing) {
        await updateComponent(db, Number(id), input);
      } else {
        await createComponent(db, { car_id: Number(carId), ...input });
      }
      router.back();
    } catch (error) {
      Alert.alert('Could not save component', error instanceof Error ? error.message : String(error));
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
      <Stack.Screen options={{ title: isEditing ? 'Edit Component' : 'Add Component' }} />
      <Card>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Front tyres" />
        <TextField
          label="Category"
          value={category}
          onChangeText={setCategory}
          placeholder="e.g. Tyres, Brakes, Engine"
        />
        <TextField
          label="Installed date"
          value={installedDate}
          onChangeText={setInstalledDate}
          placeholder="YYYY-MM-DD"
        />
        <TextField
          label="Installed mileage"
          value={installedMileage}
          onChangeText={setInstalledMileage}
          placeholder="e.g. 42000"
          keyboardType="number-pad"
        />
      </Card>

      <Button
        title={submitting ? 'Saving…' : 'Save Component'}
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
