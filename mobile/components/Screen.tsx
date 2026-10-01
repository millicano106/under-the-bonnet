import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { useSettings } from '../lib/settings';
import { colors } from '../theme';

// Decorative line-art backdrop: a soft blue wash, a faint car silhouette and a
// large wheel. Purely visual; sits behind screen content and ignores touches.
function BackgroundArt() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none" viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice">
      <Defs>
        <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#DCE8FD" stopOpacity="1" />
          <Stop offset="0.45" stopColor="#F6F6F7" stopOpacity="1" />
          <Stop offset="1" stopColor="#EEF2FB" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="400" height="800" fill="url(#wash)" />

      <Circle cx="360" cy="690" r="150" fill="none" stroke="#2F6FED" strokeOpacity="0.07" strokeWidth="26" />
      <Circle cx="360" cy="690" r="95" fill="none" stroke="#2F6FED" strokeOpacity="0.07" strokeWidth="3" />
      <Circle cx="360" cy="690" r="22" fill="#2F6FED" fillOpacity="0.07" />

      <Path
        transform="translate(20 610) scale(0.85)"
        d="M20 110 L20 90 Q20 80 40 76 L90 68 L130 38 Q140 30 160 30 L250 30 Q268 30 280 40 L315 68 L360 74 Q380 78 380 95 L380 110 Z M135 42 L160 68 L200 68 L200 34 M215 34 L215 68 L290 68 L262 42"
        fill="none"
        stroke="#2F6FED"
        strokeOpacity="0.14"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <Circle cx="105" cy="705" r="21" fill="#F6F6F7" stroke="#2F6FED" strokeOpacity="0.14" strokeWidth="3" />
      <Circle cx="275" cy="705" r="21" fill="#F6F6F7" stroke="#2F6FED" strokeOpacity="0.14" strokeWidth="3" />
    </Svg>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  return (
    <View style={styles.container}>
      {settings.showBackground ? <BackgroundArt /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
