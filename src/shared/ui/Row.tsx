import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {spacing} from '../theme';
import {Txt} from './Txt';

/** A "label — value" row; used heavily in fee breakdowns. */
export function LabelValueRow({
  label,
  value,
  labelColor,
  valueColor,
  strong = false,
  style,
}: {
  label: string;
  value: string;
  labelColor?: string;
  valueColor?: string;
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const variant = strong ? 'bodyStrong' : 'body';
  return (
    <View style={[styles.row, style]}>
      <Txt variant={variant} color={labelColor}>
        {label}
      </Txt>
      <Txt variant={variant} color={valueColor}>
        {value}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
});
