import { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect, useNavigation } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Feather } from '@expo/vector-icons';

import { Badge, Button, EmptyState, ListRow, Screen } from '../components';
import { listCars } from '../db/repository/cars';
import type { Car } from '../db/types';
import { confirmDeleteCar } from '../lib/carActions';
import { colors, radii, shadow, spacing, typography } from '../theme';

type Tab = 'active' | 'sold';

export default function GarageScreen() {
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const [cars, setCars] = useState<Car[]>([]);
  const [tab, setTab] = useState<Tab>('active');

  const reload = useCallback(() => {
    listCars(db).then(setCars);
  }, [db]);

  useFocusEffect(reload);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Link href="/settings" asChild>
          <Pressable hitSlop={8} accessibilityLabel="Settings">
            <Feather name="settings" size={22} color={colors.primary} />
          </Pressable>
        </Link>
      ),
    });
  }, [navigation]);

  const activeCars = cars.filter((car) => !car.is_sold);
  const soldCars = cars.filter((car) => car.is_sold);
  const visible = tab === 'active' ? activeCars : soldCars;

  return (
    <Screen>
      <View style={styles.tabBar}>
        {(
          [
            { key: 'active', label: 'Active', count: activeCars.length },
            { key: 'sold', label: 'Sold', count: soldCars.length },
          ] as const
        ).map((t) => (
          <Pressable
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label} ({t.count})
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(car) => String(car.id)}
        contentContainerStyle={visible.length === 0 ? styles.emptyContainer : styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          tab === 'active' ? (
            <EmptyState
              icon="truck"
              title="No active cars"
              subtitle="Add a car to start tracking it."
            />
          ) : (
            <EmptyState icon="tag" title="No sold cars" subtitle="Cars you mark as sold appear here." />
          )
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/car/[id]', params: { id: String(item.id) } }} asChild>
            <ListRow
              leadingIcon={item.is_sold ? 'tag' : 'truck'}
              title={item.name}
              subtitle={`${item.year} ${item.make} ${item.model} · ${item.registration}`}
              right={
                <View style={styles.rowRight}>
                  {item.is_sold ? <Badge label="Sold" tone="success" /> : null}
                  <Pressable
                    onPress={() => confirmDeleteCar(db, item, reload)}
                    hitSlop={8}
                    accessibilityLabel={`Delete ${item.name}`}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash-2" size={16} color={colors.danger} />
                  </Pressable>
                </View>
              }
            />
          </Link>
        )}
      />
      <View style={styles.footer}>
        <Link href="/add-car" asChild>
          <Button title="Add Car" icon="plus" onPress={() => {}} />
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.neutralSoft,
    borderRadius: radii.pill,
    padding: 4,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  tabActive: {
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  tabText: {
    ...typography.caption,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.primary,
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
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteButton: {
    padding: 4,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
});
