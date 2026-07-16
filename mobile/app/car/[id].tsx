import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { getCarById, markCarSold } from '../../db/repository/cars';
import { listComponentsByCar } from '../../db/repository/components';
import { listLogEntriesByCar } from '../../db/repository/logEntries';
import { listScheduleItemsByCar } from '../../db/repository/scheduleItems';
import type { Car, Component, LogEntry, ServiceScheduleItem } from '../../db/types';

type Section = 'financials' | 'components' | 'schedule' | 'log';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'financials', label: 'Financials' },
  { key: 'components', label: 'Components' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'log', label: 'Log' },
];

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const carId = Number(id);
  const db = useSQLiteContext();

  const [car, setCar] = useState<Car | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [scheduleItems, setScheduleItems] = useState<ServiceScheduleItem[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [section, setSection] = useState<Section>('financials');
  const [showSoldForm, setShowSoldForm] = useState(false);
  const [salePrice, setSalePrice] = useState('');
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));

  const reload = useCallback(() => {
    getCarById(db, carId).then(setCar);
    listComponentsByCar(db, carId).then(setComponents);
    listScheduleItemsByCar(db, carId).then(setScheduleItems);
    listLogEntriesByCar(db, carId).then(setLogEntries);
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

  if (!car) {
    return (
      <View style={styles.container}>
        <Text>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: car.name }} />

      <View style={styles.header}>
        <Text style={styles.title}>{car.name}</Text>
        <Text style={styles.subtitle}>
          {car.year} {car.make} {car.model} · {car.registration}
        </Text>
        {car.colour ? <Text style={styles.subtitle}>Colour: {car.colour}</Text> : null}
        {car.is_sold ? (
          <Text style={styles.soldBadge}>
            Sold for £{car.sale_price} on {car.sale_date}
          </Text>
        ) : null}
      </View>

      {!car.is_sold && !showSoldForm && (
        <Pressable style={styles.soldButton} onPress={() => setShowSoldForm(true)}>
          <Text style={styles.soldButtonText}>Mark as Sold</Text>
        </Pressable>
      )}

      {showSoldForm && (
        <View style={styles.soldForm}>
          <TextInput
            style={styles.input}
            placeholder="Sale price"
            keyboardType="decimal-pad"
            value={salePrice}
            onChangeText={setSalePrice}
          />
          <TextInput
            style={styles.input}
            placeholder="Sale date (YYYY-MM-DD)"
            value={saleDate}
            onChangeText={setSaleDate}
          />
          <View style={styles.soldFormActions}>
            <Pressable style={styles.soldButton} onPress={handleMarkSold}>
              <Text style={styles.soldButtonText}>Confirm Sale</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setShowSoldForm(false)}>
              <Text>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.tabBar}>
        {SECTIONS.map((s) => (
          <Pressable
            key={s.key}
            style={[styles.tab, section === s.key && styles.tabActive]}
            onPress={() => setSection(s.key)}
          >
            <Text style={[styles.tabText, section === s.key && styles.tabTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.sectionContent}>
        {section === 'financials' && (
          <View>
            <Text style={styles.row}>Purchase price: £{car.purchase_price}</Text>
            <Text style={styles.row}>Purchase date: {car.purchase_date}</Text>
            {car.is_sold ? (
              <>
                <Text style={styles.row}>Sale price: £{car.sale_price}</Text>
                <Text style={styles.row}>Sale date: {car.sale_date}</Text>
              </>
            ) : null}
          </View>
        )}
        {section === 'components' && (
          <EmptyOrList items={components} label="components" renderLabel={(c) => c.name} />
        )}
        {section === 'schedule' && (
          <EmptyOrList items={scheduleItems} label="schedule items" renderLabel={(s) => s.name} />
        )}
        {section === 'log' && (
          <EmptyOrList items={logEntries} label="log entries" renderLabel={(l) => l.title} />
        )}
      </View>
    </ScrollView>
  );
}

function EmptyOrList<T>(props: { items: T[]; label: string; renderLabel: (item: T) => string }) {
  if (props.items.length === 0) {
    return <Text style={styles.emptyText}>No {props.label} yet.</Text>;
  }
  return (
    <View>
      {props.items.map((item, index) => (
        <Text key={index} style={styles.row}>
          {props.renderLabel(item)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    color: '#666',
  },
  soldBadge: {
    marginTop: 8,
    fontWeight: '600',
    color: '#1a7a2e',
  },
  soldButton: {
    backgroundColor: '#c0392b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  soldButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  soldForm: {
    marginBottom: 16,
    gap: 8,
  },
  soldFormActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1a73e8',
  },
  tabText: {
    color: '#666',
  },
  tabTextActive: {
    color: '#1a73e8',
    fontWeight: '600',
  },
  sectionContent: {
    paddingBottom: 32,
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  emptyText: {
    color: '#888',
    fontStyle: 'italic',
    paddingVertical: 16,
    textAlign: 'center',
  },
});
