import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button, Card, TextField } from '../components';
import { createCar } from '../db/repository/cars';
import { todayIsoDate } from '../lib/formValues';
import { colors, spacing } from '../theme';

export default function AddCarScreen() {
  const db = useSQLiteContext();
  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [registration, setRegistration] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(todayIsoDate());
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    make.trim().length > 0 &&
    model.trim().length > 0 &&
    /^\d{4}$/.test(year.trim()) &&
    registration.trim().length > 0 &&
    purchasePrice.trim().length > 0 &&
    !Number.isNaN(Number(purchasePrice)) &&
    purchaseDate.trim().length > 0;

  async function handleSubmit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const car = await createCar(db, {
        name: name.trim(),
        make: make.trim(),
        model: model.trim(),
        year: Number(year.trim()),
        registration: registration.trim(),
        purchase_price: Number(purchasePrice),
        purchase_date: purchaseDate.trim(),
      });
      router.replace({ pathname: '/car/[id]', params: { id: String(car.id) } });
    } catch (error) {
      Alert.alert('Could not save car', error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. GTI" />
        <TextField label="Make" value={make} onChangeText={setMake} placeholder="e.g. Volkswagen" />
        <TextField label="Model" value={model} onChangeText={setModel} placeholder="e.g. Golf" />
        <TextField
          label="Year"
          value={year}
          onChangeText={setYear}
          placeholder="e.g. 2018"
          keyboardType="number-pad"
        />
        <TextField
          label="Registration"
          value={registration}
          onChangeText={setRegistration}
          placeholder="e.g. AB18 CDE"
          autoCapitalize="characters"
        />
        <TextField
          label="Purchase price"
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          placeholder="e.g. 12500"
          keyboardType="decimal-pad"
        />
        <TextField
          label="Purchase date"
          value={purchaseDate}
          onChangeText={setPurchaseDate}
          placeholder="YYYY-MM-DD"
        />
      </Card>

      <Button
        title={submitting ? 'Saving…' : 'Save Car'}
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
    backgroundColor: colors.background,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
