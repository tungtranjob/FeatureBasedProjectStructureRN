import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';

interface SelectorRowProps {
  icon: string;
  title: string;
  value: string;
  placeholder?: string;
  onPress: () => void;
}

/** A "tap to choose" row — used for the address and the voucher. */
export function SelectorRow({
  icon,
  title,
  value,
  placeholder = 'Chạm để chọn',
  onPress,
}: SelectorRowProps) {
  const isEmpty = value.length === 0;

  return (
    <Card onPress={onPress} style={styles.card}>
      <Txt style={styles.icon}>{icon}</Txt>
      <View style={styles.info}>
        <Txt variant="caption">{title}</Txt>
        <Txt
          variant="bodyStrong"
          color={isEmpty ? colors.textMuted : colors.text}
          numberOfLines={2}>
          {isEmpty ? placeholder : value}
        </Txt>
      </View>
      <Txt variant="body" color={colors.textMuted}>
        ›
      </Txt>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  icon: {fontSize: 20},
  info: {flex: 1, gap: 2},
});
