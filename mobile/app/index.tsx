import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { listCars } from '../db/repository/cars';
import type { Car } from '../db/types';

export default function GarageScreen() {
  const db = useSQLiteContext();
  const [cars, setCars] = useState<Car[]>([]);

  useFocusEffect(
    useCallback(() => {
      listCars(db).then(setCars);
    }, [db])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cars}
        keyExtractor={(car) => String(car.id)}
        contentContainerStyle={cars.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <View>
            <Text style={styles.emptyTitle}>No cars yet</Text>
            <Text style={styles.emptySubtitle}>Add your first car to start tracking it.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/car/[id]', params: { id: String(item.id) } }} asChild>
            <Pressable style={styles.row}>
              <Text style={styles.rowTitle}>
                {item.name} {item.is_sold ? '(sold)' : ''}
              </Text>
              <Text style={styles.rowSubtitle}>
                {item.year} {item.make} {item.model} · {item.registration}
              </Text>
            </Pressable>
          </Link>
        )}
      />
      <Link href="/add-car" asChild>
        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Car</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 4,
    color: '#666',
    textAlign: 'center',
  },
  row: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    marginTop: 2,
    color: '#666',
  },
  addButton: {
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
