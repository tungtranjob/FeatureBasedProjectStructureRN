import React from 'react';
import {Text, type TextProps, type TextStyle} from 'react-native';
import {typography, type TypographyVariant} from '../theme';

interface TxtProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
}

/**
 * Bọc <Text> để ép mọi chữ trong app đi qua thang typography.
 *
 * Quy ước: component trong shared/ui KHÔNG biết gì về nghiệp vụ. Nó không
 * biết "giá món ăn" là gì, chỉ biết "chữ đậm màu cam". Nghiệp vụ nằm ở feature.
 */
export function Txt({variant = 'body', color, style, ...rest}: TxtProps) {
  const base = typography[variant] as TextStyle;
  return <Text {...rest} style={[base, color ? {color} : null, style]} />;
}
