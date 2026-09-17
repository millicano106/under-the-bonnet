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

import { colors, radii, spacing } from '../theme';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';

export function Button(props: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const variant = props.variant ?? 'primary';
  const isDisabled = props.disabled || props.loading;

  return (
    <Pressable
      style={[styles.base, variantStyles[variant].container, isDisabled && styles.disabled, props.style]}
      onPress={props.onPress}
      disabled={isDisabled}
    >
      {props.loading ? (
        <ActivityIndicator color={variantStyles[variant].text.color} />
      ) : (
        <View style={styles.content}>
          {props.icon ? (
            <Feather
              name={props.icon}
              size={17}
              color={variantStyles[variant].text.color}
              style={styles.icon}
            />
          ) : null}
          <Text style={[styles.text, variantStyles[variant].text]}>{props.title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    paddingVertical: 14,
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
    fontSize: 16,
    fontWeight: '600',
  },
});

const variantStyles: Record<Variant, { container: object; text: { color: string } }> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: { color: colors.white },
  },
  secondary: {
    container: { backgroundColor: colors.neutralSoft },
    text: { color: colors.textPrimary },
  },
  destructive: {
    container: { backgroundColor: colors.danger },
    text: { color: colors.white },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
  },
};
