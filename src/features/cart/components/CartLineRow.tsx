import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {QuantityStepper, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {formatCurrency} from '@shared/lib/format';
import type {CartLine} from '../model/types';

interface CartLineRowProps {
  line: CartLine;
  onChangeQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartLineRow({line, onChangeQuantity, onRemove}: CartLineRowProps) {
  return (
    <View style={styles.row} testID={`cart-line-${line.id}`}>
      <Image source={{uri: line.imageUrl}} style={styles.thumb} />

      <View style={styles.info}>
        <Txt variant="bodyStrong" numberOfLines={2}>
          {line.name}
        </Txt>

        {line.optionNames.length > 0 && (
          <Txt variant="caption" numberOfLines={2}>
            {line.optionNames.join(', ')}
          </Txt>
        )}

        {!!line.note && (
          <Txt variant="tiny" numberOfLines={1}>
            Ghi chú: {line.note}
          </Txt>
        )}

        <View style={styles.bottomRow}>
          <Txt variant="bodyStrong" color={colors.primary}>
            {formatCurrency(line.unitPrice * line.quantity)}
          </Txt>

          <QuantityStepper
            value={line.quantity}
            // min = 0 so stepping down to 0 removes the item — the familiar behaviour
            // in food delivery apps.
            min={0}
            onChange={next => (next === 0 ? onRemove() : onChangeQuantity(next))}
            testID={`cart-qty-${line.id}`}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  info: {flex: 1, gap: 2},
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
