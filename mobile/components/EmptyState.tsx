import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, spacing, typography } from '../theme';

export function EmptyState(props: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Feather.glyphMap;
}) {
  return (
    <View style={styles.container}>
      <Feather name={props.icon ?? 'inbox'} size={28} color={colors.textMuted} />
      <Text style={styles.title}>{props.title}</Text>
      {props.subtitle ? <Text style={styles.subtitle}>{props.subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.heading,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
