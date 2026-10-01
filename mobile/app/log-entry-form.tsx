import { useEffect, useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Feather } from '@expo/vector-icons';

import { Button, Card, TextField } from '../components';
import { createLogEntry, getLogEntryById, updateLogEntry } from '../db/repository/logEntries';
import {
  addInvoicePhoto,
  deleteInvoicePhoto,
  listInvoicePhotosByLogEntry,
} from '../db/repository/invoicePhotos';
import type { InvoicePhoto, LogEntryType } from '../db/types';
import { deleteInvoicePhotoFile, pickInvoicePhotoAsync } from '../lib/invoicePhotos';
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
  const [savedPhotos, setSavedPhotos] = useState<InvoicePhoto[]>([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<number[]>([]);
  const [newPhotoUris, setNewPhotoUris] = useState<string[]>([]);

  // Newly picked photos are copied into app storage straight away; if the form
  // is left without saving, those orphaned files are deleted on unmount.
  const newPhotoUrisRef = useRef<string[]>([]);
  const savedRef = useRef(false);
  newPhotoUrisRef.current = newPhotoUris;
  useEffect(
    () => () => {
      if (!savedRef.current) newPhotoUrisRef.current.forEach(deleteInvoicePhotoFile);
    },
    []
  );

  useEffect(() => {
    if (!id) return;
    listInvoicePhotosByLogEntry(db, Number(id)).then(setSavedPhotos);
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

  async function handleAddPhoto(source: 'camera' | 'library') {
    try {
      const uri = await pickInvoicePhotoAsync(source);
      if (uri) setNewPhotoUris((current) => [...current, uri]);
    } catch (error) {
      Alert.alert('Could not add photo', error instanceof Error ? error.message : String(error));
    }
  }

  function removeNewPhoto(uri: string) {
    deleteInvoicePhotoFile(uri);
    setNewPhotoUris((current) => current.filter((u) => u !== uri));
  }

  const visibleSavedPhotos = savedPhotos.filter((photo) => !removedPhotoIds.includes(photo.id));

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
      let logEntryId: number;
      if (isEditing) {
        logEntryId = Number(id);
        await updateLogEntry(db, logEntryId, input);
      } else {
        logEntryId = (await createLogEntry(db, { car_id: Number(carId), ...input })).id;
      }
      for (const uri of newPhotoUris) {
        await addInvoicePhoto(db, { car_id: Number(carId), log_entry_id: logEntryId, uri });
      }
      for (const photo of savedPhotos.filter((p) => removedPhotoIds.includes(p.id))) {
        await deleteInvoicePhoto(db, photo.id);
        deleteInvoicePhotoFile(photo.uri);
      }
      savedRef.current = true;
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

      <Card style={styles.photoCard}>
        <Text style={styles.label}>Invoice photos</Text>
        <View style={styles.photoGrid}>
          {visibleSavedPhotos.map((photo) => (
            <View key={`saved-${photo.id}`} style={styles.photoWrap}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <Pressable
                style={styles.photoRemove}
                onPress={() => setRemovedPhotoIds((current) => [...current, photo.id])}
                hitSlop={6}
                accessibilityLabel="Remove photo"
              >
                <Feather name="x" size={14} color={colors.white} />
              </Pressable>
            </View>
          ))}
          {newPhotoUris.map((uri) => (
            <View key={uri} style={styles.photoWrap}>
              <Image source={{ uri }} style={styles.photo} />
              <Pressable
                style={styles.photoRemove}
                onPress={() => removeNewPhoto(uri)}
                hitSlop={6}
                accessibilityLabel="Remove photo"
              >
                <Feather name="x" size={14} color={colors.white} />
              </Pressable>
            </View>
          ))}
        </View>
        <View style={styles.photoActions}>
          <Button
            title="Take photo"
            icon="camera"
            variant="secondary"
            onPress={() => handleAddPhoto('camera')}
            style={styles.photoButton}
          />
          <Button
            title="Choose photo"
            icon="image"
            variant="secondary"
            onPress={() => handleAddPhoto('library')}
            style={styles.photoButton}
          />
        </View>
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
  photoCard: {
    marginTop: spacing.lg,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoWrap: {
    width: 92,
    height: 92,
  },
  photo: {
    width: 92,
    height: 92,
    borderRadius: radii.md,
    backgroundColor: colors.neutralSoft,
  },
  photoRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoButton: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
