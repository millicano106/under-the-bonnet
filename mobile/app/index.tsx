import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, EmptyState, ListRow, Screen } from '../components';
import { listCars } from '../db/repository/cars';
import type { Car } from '../db/types';
import { useAccent } from '../lib/accent';
import { confirmDeleteCar } from '../lib/carActions';
import { colors, fonts, radii, spacing, TOUCH_TARGET, typography } from '../theme';

type Tab = 'active' | 'sold';

export default function GarageScreen() {
  const db = useSQLiteContext();
  const accent = useAccent();
  const [cars, setCars] = useState<Car[]>([]);
  const [tab, setTab] = useState<Tab>('active');

  const reload = useCallback(() => {
    listCars(db).then(setCars);
  }, [db]);

  useFocusEffect(reload);

  const activeCars = cars.filter((car) => !car.is_sold);
  const soldCars = cars.filter((car) => car.is_sold);
  const visible = tab === 'active' ? activeCars : soldCars;

  return (
    <Screen>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.overline, { color: accent.text }]}>Under the bonnet</Text>
            <Text style={styles.title} accessibilityRole="header">
              Garage
            </Text>
          </View>
          <Link href="/settings" asChild>
            <Pressable style={styles.settingsButton} accessibilityRole="button" accessibilityLabel="Settings">
              <Feather name="settings" size={20} color={accent.text} />
            </Pressable>
          </Link>
        </View>

        <View style={styles.tabBar} accessibilityRole="tablist">
          {(
            [
              { key: 'active', label: 'Active', count: activeCars.length },
              { key: 'sold', label: 'Sold', count: soldCars.length },
            ] as const
          ).map((t) => {
            const selected = tab === t.key;
            return (
              <Pressable
                key={t.key}
                style={[styles.tab, selected && { backgroundColor: accent.fill }]}
                onPress={() => setTab(t.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.tabText, selected && { color: accent.on }]}>
                  {t.label} <Text style={styles.tabCount}>{t.count}</Text>
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={visible}
          keyExtractor={(car) => String(car.id)}
          style={styles.listWrap}
          contentContainerStyle={visible.length === 0 ? styles.emptyContainer : styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            tab === 'active' ? (
              <EmptyState icon="truck" title="No active cars" subtitle="Add a car to start tracking it." />
            ) : (
              <EmptyState icon="tag" title="No sold cars" subtitle="Cars you mark as sold appear here." />
            )
          }
          renderItem={({ item }) => (
            <Link href={{ pathname: '/car/[id]', params: { id: String(item.id) } }} asChild>
              <ListRow
                leadingIcon={item.is_sold ? 'tag' : 'truck'}
                title={item.name}
                plate={item.registration}
                subtitle={`${item.year} ${item.make} ${item.model}`}
                right={
                  <View style={styles.rowRight}>
                    {item.is_sold ? <Badge label="Sold" tone="success" /> : null}
                    <Pressable
                      onPress={() => confirmDeleteCar(db, item, reload)}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${item.name}`}
                      style={styles.deleteButton}
                    >
                      <Feather name="trash-2" size={17} color={accent.danger} />
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
      </SafeAreaView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  overline: {
    ...typography.label,
  },
  title: {
    ...typography.title,
    marginTop: 2,
  },
  // Solid surface so the icon never sits directly on the flag artwork.
  settingsButton: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.controlBorder,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabTrack,
    borderRadius: radii.pill,
    padding: 4,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  tab: {
    flex: 1,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  tabText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textTab,
  },
  tabCount: {
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  listWrap: {
    flex: 1,
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
    gap: spacing.xs,
  },
  deleteButton: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingTop: 0,
  },
});
