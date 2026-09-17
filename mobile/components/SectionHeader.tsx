import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, radii, spacing, typography } from '../theme';

export function SectionHeader(props: {
  title: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{props.title}</Text>
      {props.action ? (
        <Pressable style={styles.action} onPress={props.action.onPress}>
          <Feather name="plus" size={14} color={colors.primary} />
          <Text style={styles.actionText}>{props.action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.heading,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
  },
  actionText: {
    ...typography.label,
    color: colors.primary,
    marginLeft: 4,
  },
});
