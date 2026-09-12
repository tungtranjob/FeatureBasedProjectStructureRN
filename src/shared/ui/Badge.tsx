import React from 'react';
import {StyleSheet, View} from 'react-native';
import {colors, radius, spacing} from '../theme';
import {Txt} from './Txt';

interface BadgeProps {
  label: string;
  color?: string;
  background?: string;
}

export function Badge({
  label,
  color = colors.primary,
  background = colors.primarySoft,
}: BadgeProps) {
  return (
    <View style={[styles.badge, {backgroundColor: background}]}>
      <Txt variant="tiny" color={color}>
        {label}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
});
