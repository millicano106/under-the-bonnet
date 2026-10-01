import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg';

import { useAccent } from '../lib/accent';
import { useSettings } from '../lib/settings';
import { colors } from '../theme';

const GRID = 18;
const FLAG_COLS = 10;
const FLAG_ROWS = 9;

// Decorative only: dot grid base layer, plus an optional chequered flag fading
// in from the top-right corner. Sits behind content; text never sits on it.
function BackgroundArt({ flag, color }: { flag: boolean; color: string }) {
  const { width } = useWindowDimensions();

  const squares = useMemo(() => {
    const result: { key: string; x: number; y: number; opacity: number }[] = [];
    const x0 = width - GRID * FLAG_COLS;
    for (let i = 0; i < FLAG_COLS; i++) {
      for (let j = 0; j < FLAG_ROWS; j++) {
        if ((i + j) % 2) continue;
        const d = Math.sqrt((FLAG_COLS - 1 - i) ** 2 * 0.8 + j ** 2);
        const opacity = 0.2 - d * 0.025;
        if (opacity >= 0.02) result.push({ key: `${i}-${j}`, x: x0 + i * GRID, y: j * GRID, opacity });
      }
    }
    return result;
  }, [width]);

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Defs>
        {/* Offset so the grid lines up with the flag squares at the right edge. */}
        <Pattern id="dots" x={width % GRID} y={0} width={GRID} height={GRID} patternUnits="userSpaceOnUse">
          <Circle cx={1} cy={1} r={1} fill={colors.textPrimary} fillOpacity={0.1} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#dots)" />
      {flag
        ? squares.map((square) => (
            <Rect
              key={square.key}
              x={square.x}
              y={square.y}
              width={GRID}
              height={GRID}
              fill={color}
              fillOpacity={square.opacity}
            />
          ))
        : null}
    </Svg>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const accent = useAccent();
  return (
    <View style={styles.container}>
      {settings.showBackground ? (
        <BackgroundArt flag={settings.showChequeredFlag} color={accent.text} />
      ) : null}
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
