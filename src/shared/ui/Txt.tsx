import React from 'react';
import {Text, type TextProps, type TextStyle} from 'react-native';
import {typography, type TypographyVariant} from '../theme';

interface TxtProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

/**
 * Wraps <Text> so every piece of text in the app goes through the typography scale.
 *
 * Convention: components in shared/ui know NOTHING about the domain. This one does
 * not know what a "dish price" is, only "bold orange text". Domain logic lives in features.
 */
export function Txt({variant = 'body', color, style, ...rest}: TxtProps) {
  const base = typography[variant] as TextStyle;
  return <Text {...rest} style={[base, color ? {color} : null, style]} />;
}
