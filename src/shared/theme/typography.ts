import type {TextStyle} from 'react-native';
import {colors} from './colors';

export const typography = {
  h1: {fontSize: 26, fontWeight: '700', color: colors.text},
  h2: {fontSize: 20, fontWeight: '700', color: colors.text},
  h3: {fontSize: 17, fontWeight: '600', color: colors.text},
  body: {fontSize: 15, fontWeight: '400', color: colors.text},
  bodyStrong: {fontSize: 15, fontWeight: '600', color: colors.text},
  caption: {fontSize: 13, fontWeight: '400', color: colors.textMuted},
  tiny: {fontSize: 11, fontWeight: '500', color: colors.textMuted},
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
