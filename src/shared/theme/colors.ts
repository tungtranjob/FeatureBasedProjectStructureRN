/**
 * Design tokens — the SINGLE source of truth for colour.
 *
 * Never hardcode '#FF5722' in a component. The reason is not aesthetics:
 * when the brand colour changes or dark mode arrives, you edit this one file
 * instead of grepping 300 places and missing 20 of them.
 */
export const colors = {
  primary: '#EE4D2D',
  primaryDark: '#D23F20',
  primarySoft: '#FFF1EE',

  success: '#12B76A',
  warning: '#F79009',
  danger: '#F04438',
  info: '#2E90FA',

  text: '#111827',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',

  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceAlt: '#F3F4F6',
  border: '#E5E7EB',

  overlay: 'rgba(17, 24, 39, 0.45)',
  skeleton: '#E5E7EB',
} as const;

export type ColorToken = keyof typeof colors;
