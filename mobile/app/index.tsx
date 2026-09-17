import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Button, EmptyState, ListRow } from '../components';
import { listCars } from '../db/repository/cars';
import type { Car } from '../db/types';
import { colors, spacing } from '../theme';

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
        contentContainerStyle={cars.length === 0 ? styles.emptyContainer : styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <EmptyState
            icon="truck"
            title="No cars yet"
            subtitle="Add your first car to start tracking it."
          />
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/car/[id]', params: { id: String(item.id) } }} asChild>
            <ListRow
              leadingIcon="truck"
              title={`${item.name}${item.is_sold ? ' (sold)' : ''}`}
              subtitle={`${item.year} ${item.make} ${item.model} · ${item.registration}`}
            />
          </Link>
        )}
      />
      <View style={styles.footer}>
        <Link href="/add-car" asChild>
          <Button title="Add Car" icon="plus" onPress={() => {}} />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
  },
  separator: {
    height: spacing.sm,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
});
