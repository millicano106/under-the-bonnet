import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAccent } from '../lib/accent';
import { colors, fonts, radii, spacing } from '../theme';

type Tone = 'neutral' | 'primary' | 'success' | 'danger';

export function Badge(props: { label: string; tone?: Tone; icon?: keyof typeof Feather.glyphMap }) {
  const accent = useAccent();
  const tone = props.tone ?? 'neutral';
  const toneStyles: Record<Tone, { backgroundColor: string; color: string }> = {
    neutral: { backgroundColor: colors.chipBg, color: colors.chipText },
    primary: { backgroundColor: accent.soft, color: accent.text },
    success: { backgroundColor: colors.successSoft, color: '#1E6B38' },
    danger: { backgroundColor: colors.dangerSoft, color: accent.danger },
  };
  const { backgroundColor, color } = toneStyles[tone];

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      {props.icon ? <Feather name={props.icon} size={11} color={color} style={styles.icon} /> : null}
      <Text style={[styles.text, { color }]}>{props.label}</Text>
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
    fontFamily: fonts.medium,
    fontSize: 13,
  },
});
