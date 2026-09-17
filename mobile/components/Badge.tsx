import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { colors, radii, spacing, typography } from '../theme';

type Tone = 'neutral' | 'primary' | 'success' | 'danger';

export function Badge(props: { label: string; tone?: Tone; icon?: keyof typeof Feather.glyphMap }) {
  const tone = props.tone ?? 'neutral';
  return (
    <View style={[styles.badge, toneStyles[tone].container]}>
      {props.icon ? (
        <Feather name={props.icon} size={11} color={toneStyles[tone].text.color} style={styles.icon} />
      ) : null}
      <Text style={[styles.text, toneStyles[tone].text]}>{props.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});

const toneStyles: Record<Tone, { container: object; text: { color: string } }> = {
  neutral: {
    container: { backgroundColor: colors.neutralSoft },
    text: { color: colors.neutral },
  },
  primary: {
    container: { backgroundColor: colors.primarySoft },
    text: { color: colors.primary },
  },
  success: {
    container: { backgroundColor: colors.successSoft },
    text: { color: colors.success },
  },
  danger: {
    container: { backgroundColor: colors.dangerSoft },
    text: { color: colors.danger },
  },
};
