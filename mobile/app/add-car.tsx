import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { createCar } from '../db/repository/cars';

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

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
      <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. GTI" />
      <Field label="Make" value={make} onChangeText={setMake} placeholder="e.g. Volkswagen" />
      <Field label="Model" value={model} onChangeText={setModel} placeholder="e.g. Golf" />
      <Field
        label="Year"
        value={year}
        onChangeText={setYear}
        placeholder="e.g. 2018"
        keyboardType="number-pad"
      />
      <Field
        label="Registration"
        value={registration}
        onChangeText={setRegistration}
        placeholder="e.g. AB18 CDE"
        autoCapitalize="characters"
      />
      <Field
        label="Purchase price"
        value={purchasePrice}
        onChangeText={setPurchasePrice}
        placeholder="e.g. 12500"
        keyboardType="decimal-pad"
      />
      <Field
        label="Purchase date"
        value={purchaseDate}
        onChangeText={setPurchaseDate}
        placeholder="YYYY-MM-DD"
      />

      <Pressable
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit || submitting}
      >
        <Text style={styles.submitButtonText}>{submitting ? 'Saving…' : 'Save Car'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'characters' | 'words' | 'sentences';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        keyboardType={props.keyboardType ?? 'default'}
        autoCapitalize={props.autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
