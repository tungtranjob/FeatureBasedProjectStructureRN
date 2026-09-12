import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import type {Money} from '@shared/types/money';
import {getAvailableMethods} from '../model/payment-method.registry';
import {getCurrentPlatform} from '../lib/current-platform';
import type {PaymentMethod} from '../model/types';

interface PaymentMethodListProps {
  amount: Money;
  selected: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

/**
 * The payment method list — exported for the checkout feature to use.
 *
 * It filters by limit and platform itself (via getAvailableMethods), so checkout does
 * not need to know "COD only for orders under 1 million". That rule belongs to payment.
 */
export function PaymentMethodList({
  amount,
  selected,
  onSelect,
}: PaymentMethodListProps) {
  // The component layer is a legitimate place to read OS state.
  const methods = getAvailableMethods(amount, getCurrentPlatform());

  return (
    <View style={styles.list}>
      {methods.map(info => {
        const isSelected = info.method === selected;
        return (
          <Pressable
            key={info.method}
            onPress={() => onSelect(info.method)}
            testID={`payment-method-${info.method}`}
            style={({pressed}) => [
              styles.row,
              isSelected && styles.selected,
              pressed && styles.pressed,
            ]}>
            <Txt style={styles.icon}>{info.icon}</Txt>
            <View style={styles.info}>
              <Txt variant="bodyStrong">{info.label}</Txt>
              <Txt variant="tiny">{info.description}</Txt>
            </View>
            <View style={[styles.radio, isSelected && styles.radioSelected]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {gap: spacing.sm},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: {borderColor: colors.primary, backgroundColor: colors.primarySoft},
  pressed: {opacity: 0.8},
  icon: {fontSize: 24},
  info: {flex: 1, gap: 2},
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioSelected: {borderColor: colors.primary, borderWidth: 6},
});
