import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAccent } from '../lib/accent';
import { fonts, radii, spacing, TOUCH_TARGET, typography } from '../theme';

export function SectionHeader(props: {
  title: string;
  action?: { label: string; onPress: () => void };
}) {
  const accent = useAccent();
  return (
    <View style={styles.row}>
      <Text style={styles.title} accessibilityRole="header">
        {props.title}
      </Text>
      {props.action ? (
        <Pressable
          style={[styles.action, { backgroundColor: accent.soft }]}
          onPress={props.action.onPress}
          accessibilityRole="button"
          accessibilityLabel={`${props.action.label} ${props.title}`}
        >
          <Feather name="plus" size={14} color={accent.text} />
          <Text style={[styles.actionText, { color: accent.text }]}>{props.action.label}</Text>
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
    ...typography.label,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  actionText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    marginLeft: 4,
  },
});
