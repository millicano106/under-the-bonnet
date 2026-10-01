import { colors, PAINTS, type Paint } from '../theme';
import { useSettings } from './settings';

// Rosso Corsa is itself a red, so delete actions switch to a darker red there
// to avoid clashing with the accent.
const DANGER_ON_ROSSO = '#9E2B2B';

export type Accent = Paint & { danger: string };

// The current accent paint. Use `fill` behind `on` text, and `text` wherever the
// accent colours text or icons on paper/white/soft. Never use `fill` as text.
export function useAccent(): Accent {
  const { settings } = useSettings();
  const paint = PAINTS.find((p) => p.name === settings.accentPaint) ?? PAINTS[0];
  return { ...paint, danger: paint.name === 'Rosso Corsa' ? DANGER_ON_ROSSO : colors.danger };
}
