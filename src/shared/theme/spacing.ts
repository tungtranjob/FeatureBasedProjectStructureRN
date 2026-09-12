/**
 * 4pt spacing scale. Only use the values defined here.
 *
 * The `Spacing` type constraint makes `padding: 13` a TypeScript error —
 * which is the point: it keeps the app's visual rhythm consistent.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export type Spacing = (typeof spacing)[keyof typeof spacing];
