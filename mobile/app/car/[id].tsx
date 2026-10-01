import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Feather } from '@expo/vector-icons';

import { Badge, Button, Card, EmptyState, ListRow, Screen, SectionHeader, TextField } from '../../components';
import { getCarById, markCarSold, reopenCar } from '../../db/repository/cars';
import { deleteComponent, listComponentsByCar } from '../../db/repository/components';
import { deleteLogEntry, listLogEntriesByCar } from '../../db/repository/logEntries';
import { listInvoicePhotosByCar } from '../../db/repository/invoicePhotos';
import { listRemindersByCar } from '../../db/repository/reminders';
import { deleteScheduleItem, listScheduleItemsByCar } from '../../db/repository/scheduleItems';
import type { Car, Component, InvoicePhoto, LogEntry, Reminder, ServiceScheduleItem } from '../../db/types';
import { confirmDeleteCar } from '../../lib/carActions';
import { shareCarReportAsync } from '../../lib/carReport';
import { deleteInvoicePhotoFile } from '../../lib/invoicePhotos';
import { cancelReminderNotificationForScheduleItemAsync } from '../../lib/notifications';
import { useSettings } from '../../lib/settings';
import { useAccent } from '../../lib/accent';
import { colors, fonts, radii, spacing, TOUCH_TARGET, typography } from '../../theme';

type Section = 'financials' | 'components' | 'schedule' | 'log';

const SECTIONS: { key: Section; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'financials', label: 'Financials', icon: 'dollar-sign' },
  { key: 'components', label: 'Components', icon: 'tool' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar' },
  { key: 'log', label: 'Log', icon: 'file-text' },
];

function FinancialRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.financialRow}>
      <Text style={styles.financialLabel}>{label}</Text>
      <Text style={styles.financialValue}>{value}</Text>
    </View>
  );
}

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const carId = Number(id);
  const db = useSQLiteContext();
  const accent = useAccent();
  const { settings } = useSettings();
  const currency = settings.currencySymbol;

  const [car, setCar] = useState<Car | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ServiceScheduleItem[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [photos, setPhotos] = useState<InvoicePhoto[]>([]);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [section, setSection] = useState<Section>('financials');
  const [showSoldForm, setShowSoldForm] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));

  const reload = useCallback(() => {
    getCarById(db, carId).then(setCar);
    listComponentsByCar(db, carId).then(setComponents);
    listScheduleItemsByCar(db, carId).then(setScheduleItems);
    listLogEntriesByCar(db, carId).then(setLogEntries);
    listRemindersByCar(db, carId).then(setReminders);
    listInvoicePhotosByCar(db, carId).then(setPhotos);
  }, [db, carId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  async function handleMarkSold() {
    const priceNumber = Number(salePrice);
    if (!salePrice.trim() || Number.isNaN(priceNumber) || !saleDate.trim()) {
      Alert.alert('Enter a sale price and date');
      return;
    }
    await markCarSold(db, carId, { sale_price: priceNumber, sale_date: saleDate.trim() });
    setShowSoldForm(false);
    reload();
  }

  async function handleReopen() {
    await reopenCar(db, carId);
    reload();
  }

  async function handleShareReport() {
    setGeneratingReport(true);
    try {
      const shared = await shareCarReportAsync(db, carId);
      if (!shared) Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
    } catch (error) {
      Alert.alert('Could not create report', error instanceof Error ? error.message : String(error));
    } finally {
      setGeneratingReport(false);
    }
  }

  function confirmDelete(title: string, message: string, onDelete: () => Promise<void>) {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await onDelete();
          reload();
        },
      },
    ]);
  }

  function handleDeleteComponent(component: Component) {
    confirmDelete('Delete component?', `This will remove "${component.name}".`, async () => {
      await deleteComponent(db, component.id);
    });
  }

  function handleDeleteScheduleItem(item: ServiceScheduleItem) {
    confirmDelete('Delete schedule item?', `This will remove "${item.name}".`, async () => {
      await cancelReminderNotificationForScheduleItemAsync(db, item.id);
      await deleteScheduleItem(db, item.id);
    });
  }

  function handleDeleteLogEntry(entry: LogEntry) {
    confirmDelete('Delete log entry?', `This will remove "${entry.title}".`, async () => {
      const entryPhotos = photos.filter((photo) => photo.log_entry_id === entry.id);
      await deleteLogEntry(db, entry.id);
      entryPhotos.forEach((photo) => deleteInvoicePhotoFile(photo.uri));
    });
  }

  if (!car) {
    return (
      <Screen>
        <Text style={styles.loading}>Loading…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: car.name,
          headerRight: () => (
            <Pressable
              onPress={() => confirmDeleteCar(db, car, () => router.replace('/'))}
              style={styles.headerDelete}
              accessibilityRole="button"
              accessibilityLabel="Delete car"
            >
              <Feather name="trash-2" size={20} color={accent.danger} />
            </Pressable>
          ),
        }}
      />

      <Card style={styles.headerCard}>
        <Text style={styles.title}>{car.name}</Text>
        <View style={styles.plateRow}>
          <View style={styles.plate}>
            <Text style={styles.plateText}>{car.registration}</Text>
          </View>
          <Text style={styles.subtitleInline}>
            {car.year} {car.make} {car.model}
          </Text>
        </View>
        {car.colour ? <Text style={styles.subtitle}>Colour: {car.colour}</Text> : null}
        {car.is_sold ? (
          <View style={styles.soldBadgeWrap}>
            <Badge label={`Sold for ${currency}${car.sale_price} on ${car.sale_date}`} tone="success" />
          </View>
        ) : null}
      </Card>

      <Button
        title={generatingReport ? 'Creating report…' : 'Share PDF Report'}
        icon="share"
        variant="secondary"
        onPress={handleShareReport}
        loading={generatingReport}
        style={styles.markSoldButton}
      />

      {car.is_sold ? (
        <Button
          title="Reopen (mark as active)"
          icon="rotate-ccw"
          variant="secondary"
          onPress={handleReopen}
          style={styles.markSoldButton}
        />
      ) : null}

      {!car.is_sold && !showSoldForm && (
        <Button
          title="Mark as Sold"
          variant="secondary"
          onPress={() => setShowSoldForm(true)}
          style={styles.markSoldButton}
        />
      )}

      {showSoldForm && (
        <Card style={styles.markSoldButton}>
          <TextField
            label="Sale price"
            keyboardType="decimal-pad"
            value={salePrice}
            onChangeText={setSalePrice}
            placeholder="e.g. 9000"
          />
          <TextField
            label="Sale date"
            value={saleDate}
            onChangeText={setSaleDate}
            placeholder="YYYY-MM-DD"
          />
          <View style={styles.soldFormActions}>
            <Button title="Confirm Sale" onPress={handleMarkSold} style={styles.soldFormButton} />
            <Button
              title="Cancel"
              variant="ghost"
              onPress={() => setShowSoldForm(false)}
              style={styles.soldFormButton}
            />
          </View>
        </Card>
      )}

      <View style={styles.tabBar} accessibilityRole="tablist">
        {SECTIONS.map((s) => {
          const selected = section === s.key;
          return (
            <Pressable
              key={s.key}
              style={[styles.tab, selected && styles.tabActive]}
              onPress={() => setSection(s.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Feather name={s.icon} size={16} color={selected ? accent.text : colors.textTab} />
              <Text style={[styles.tabText, selected && { color: accent.text }]} numberOfLines={1}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionContent}>
        {section === 'financials' && (
          <Card>
            <FinancialRow label="Purchase price" value={`${currency}${car.purchase_price}`} />
            <FinancialRow label="Purchase date" value={car.purchase_date} />
            {car.is_sold ? (
              <>
                <FinancialRow label="Sale price" value={`${currency}${car.sale_price}`} />
                <FinancialRow label="Sale date" value={car.sale_date ?? ''} />
              </>
            ) : null}
          </Card>
        )}

        {section === 'components' && (
          <View>
            <SectionHeader
              title="Components"
              action={{
                label: 'Add',
                onPress: () => router.push({ pathname: '/component-form', params: { carId: String(carId) } }),
              }}
            />
            {components.length === 0 ? (
              <EmptyState icon="tool" title="No components yet" subtitle="Add tyres, brakes, and more." />
            ) : (
              <View style={styles.rowList}>
                {components.map((component) => (
                  <ListRow
                    key={component.id}
                    leadingIcon="tool"
                    title={component.name}
                    subtitle={component.category}
                    onPress={() =>
                      router.push({
                        pathname: '/component-form',
                        params: { carId: String(carId), id: String(component.id) },
                      })
                    }
                    right={
                      <Pressable
                        onPress={() => handleDeleteComponent(component)}
                        accessibilityRole="button"
                        accessibilityLabel="Delete"
                        style={styles.deleteButton}
                      >
                        <Feather name="trash-2" size={17} color={accent.danger} />
                      </Pressable>
                    }
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {section === 'schedule' && (
          <View>
            <SectionHeader
              title="Schedule"
              action={{
                label: 'Add',
                onPress: () =>
                  router.push({ pathname: '/schedule-item-form', params: { carId: String(carId) } }),
              }}
            />
            {scheduleItems.length === 0 ? (
              <EmptyState icon="calendar" title="No schedule items yet" subtitle="Track what's due and when." />
            ) : (
              <View style={styles.rowList}>
                {scheduleItems.map((item) => {
                  const reminder = reminders.find(
                    (r) => r.source_type === 'service_schedule' && r.source_id === item.id
                  );
                  return (
                    <ListRow
                      key={item.id}
                      leadingIcon="calendar"
                      title={item.name}
                      subtitle={item.next_due_date ? `Due ${item.next_due_date}` : 'No due date set'}
                      monoSubtitle
                      onPress={() =>
                        router.push({
                          pathname: '/schedule-item-form',
                          params: { carId: String(carId), id: String(item.id) },
                        })
                      }
                      right={
                        <View style={styles.scheduleRowRight}>
                          {reminder?.notification_id ? (
                            <Badge label="Reminder set" tone="success" icon="bell" />
                          ) : null}
                          <Pressable
                            onPress={() => handleDeleteScheduleItem(item)}
                            accessibilityRole="button"
                            accessibilityLabel="Delete"
                            style={styles.deleteButton}
                          >
                            <Feather name="trash-2" size={17} color={accent.danger} />
                          </Pressable>
                        </View>
                      }
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}

        {section === 'log' && (
          <View>
            <SectionHeader
              title="Log"
              action={{
                label: 'Add',
                onPress: () => router.push({ pathname: '/log-entry-form', params: { carId: String(carId) } }),
              }}
            />
            {logEntries.length === 0 ? (
              <EmptyState icon="file-text" title="No log entries yet" subtitle="Record services, notes, and costs." />
            ) : (
              <View style={styles.rowList}>
                {logEntries.map((entry) => (
                  <ListRow
                    key={entry.id}
                    leadingIcon="file-text"
                    title={entry.title}
                    monoSubtitle
                    subtitle={`${entry.entry_type} · ${entry.date}${
                      entry.cost != null ? ` · ${currency}${entry.cost}` : ''
                    }`}
                    onPress={() =>
                      router.push({
                        pathname: '/log-entry-form',
                        params: { carId: String(carId), id: String(entry.id) },
                      })
                    }
                    right={
                      <View style={styles.scheduleRowRight}>
                        {photos.some((photo) => photo.log_entry_id === entry.id) ? (
                          <Badge
                            label={String(photos.filter((photo) => photo.log_entry_id === entry.id).length)}
                            tone="primary"
                            icon="image"
                          />
                        ) : null}
                        <Pressable
                          onPress={() => handleDeleteLogEntry(entry)}
                          accessibilityRole="button"
                          accessibilityLabel="Delete"
                          style={styles.deleteButton}
                        >
                          <Feather name="trash-2" size={17} color={accent.danger} />
                        </Pressable>
                      </View>
                    }
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    padding: spacing.lg,
  },
  content: {
    padding: spacing.lg,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.carName,
  },
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  plate: {
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: radii.xs,
    paddingVertical: 1,
    paddingHorizontal: 8,
  },
  plateText: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.textPrimary,
  },
  subtitleInline: {
    ...typography.caption,
    flexShrink: 1,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  soldBadgeWrap: {
    marginTop: spacing.sm,
  },
  markSoldButton: {
    marginBottom: spacing.md,
  },
  soldFormActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  soldFormButton: {
    flex: 1,
  },
  headerDelete: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabTrack,
    borderRadius: radii.lg,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    minHeight: TOUCH_TARGET + 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: radii.md,
  },
  tabActive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textTab,
  },
  sectionContent: {
    paddingBottom: spacing.xxl,
  },
  rowList: {
    gap: spacing.sm,
  },
  financialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TOUCH_TARGET,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  financialLabel: {
    ...typography.caption,
  },
  financialValue: {
    ...typography.mono,
    fontSize: 15,
  },
  deleteButton: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
