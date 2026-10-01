import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAccent } from '../lib/accent';
import { colors, fonts, radii, spacing, TOUCH_TARGET } from '../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';

export function Button(props: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const accent = useAccent();
  const variant = props.variant ?? 'primary';
  const isDisabled = props.disabled || props.loading;

  const variants: Record<Variant, { container: ViewStyle; textColor: string }> = {
    // Accent fill always pairs with its `on` colour.
    primary: { container: { backgroundColor: accent.fill }, textColor: accent.on },
    secondary: {
      container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.controlBorder },
      textColor: colors.textPrimary,
    },
    outline: {
      container: { backgroundColor: 'transparent', borderWidth: 1, borderColor: accent.text },
      textColor: accent.text,
    },
    destructive: { container: { backgroundColor: accent.danger }, textColor: colors.white },
    ghost: { container: { backgroundColor: 'transparent' }, textColor: accent.text },
  };
  const { container, textColor } = variants[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(isDisabled) }}
      style={[styles.base, container, isDisabled && styles.disabled, props.style]}
      onPress={props.onPress}
      disabled={isDisabled}
    >
      {props.loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {props.icon ? <Feather name={props.icon} size={17} color={textColor} style={styles.icon} /> : null}
          <Text style={[styles.text, { color: textColor }]}>{props.title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    minHeight: TOUCH_TARGET + 4,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.xs,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
});
