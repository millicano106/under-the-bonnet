import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, radii, shadow, spacing, typography } from '../theme';

export function ListRow(props: {
  title: string;
  subtitle?: string;
  leadingIcon?: keyof typeof Feather.glyphMap;
  right?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={props.onPress}>
      {props.leadingIcon ? (
        <View style={styles.iconCircle}>
          <Feather name={props.leadingIcon} size={16} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {props.title}
        </Text>
        {props.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {props.subtitle}
          </Text>
        ) : null}
      </View>
      {props.right ? <View style={styles.right}>{props.right}</View> : null}
      {props.onPress ? (
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  right: {
    marginLeft: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
