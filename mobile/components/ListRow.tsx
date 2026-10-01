import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAccent } from '../lib/accent';
import { colors, fonts, radii, spacing, TOUCH_TARGET, typography } from '../theme';

export function ListRow(props: {
  title: string;
  subtitle?: string;
  // Renders the subtitle in mono (dates, costs).
  monoSubtitle?: boolean;
  // Registration shown as a plate chip beside the subtitle.
  plate?: string;
  leadingIcon?: keyof typeof Feather.glyphMap;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const accent = useAccent();
  return (
    <Pressable style={styles.row} onPress={props.onPress} accessibilityRole={props.onPress ? 'button' : undefined}>
      {props.leadingIcon ? (
        <View style={[styles.iconTile, { backgroundColor: accent.soft }]}>
          <Feather name={props.leadingIcon} size={17} color={accent.text} />
        </View>
      ) : null}
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {props.title}
        </Text>
        {props.subtitle || props.plate ? (
          <View style={styles.subtitleRow}>
            {props.plate ? (
              <View style={styles.plate}>
                <Text style={styles.plateText}>{props.plate}</Text>
              </View>
            ) : null}
            {props.subtitle ? (
              <Text
                style={[styles.subtitle, props.monoSubtitle && styles.subtitleMono, styles.subtitleFlex]}
                numberOfLines={1}
              >
                {props.subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      {props.right ? <View style={styles.right}>{props.right}</View> : null}
      {props.onPress ? <Feather name="chevron-right" size={18} color={colors.iconMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH_TARGET + 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    ...typography.rowTitle,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: spacing.sm,
  },
  subtitle: {
    ...typography.caption,
  },
  subtitleFlex: {
    flexShrink: 1,
  },
  subtitleMono: {
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  plate: {
    borderWidth: 1,
    borderColor: colors.textPrimary,
    borderRadius: radii.xs,
    paddingVertical: 1,
    paddingHorizontal: 6,
  },
  plateText: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textPrimary,
  },
  right: {
    marginLeft: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
