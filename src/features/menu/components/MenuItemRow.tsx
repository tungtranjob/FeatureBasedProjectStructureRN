import React from 'react';
import {Image, Pressable, StyleSheet, View} from 'react-native';
import {Badge, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {formatCurrency} from '@shared/lib/format';
import type {MenuItem} from '../model/types';

interface MenuItemRowProps {
  item: MenuItem;
  /** When the restaurant is closed the whole row is disabled, even if the item is in stock. */
  canOrder: boolean;
  onPress: () => void;
}

export function MenuItemRow({item, canOrder, onPress}: MenuItemRowProps) {
  // Two different reasons for being unorderable -> two different messages.
  // Collapsing them into one "disabled" flag is the fastest way to confuse the user.
  const disabled = !canOrder || !item.isAvailable;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={`menu-item-${item.id}`}
      style={({pressed}) => [
        styles.row,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}>
      <View style={styles.info}>
        <Txt variant="bodyStrong" numberOfLines={1}>
          {item.name}
        </Txt>
        {!!item.description && (
          <Txt variant="caption" numberOfLines={2}>
            {item.description}
          </Txt>
        )}
        <View style={styles.priceRow}>
          <Txt variant="bodyStrong" color={colors.primary}>
            {formatCurrency(item.basePrice)}
          </Txt>
          {item.soldCount > 0 && (
            <Txt variant="tiny">Đã bán {item.soldCount}</Txt>
          )}
        </View>
        {!item.isAvailable && (
          <Badge label="Hết hàng" color={colors.danger} background="#FDECEA" />
        )}
      </View>

      <Image source={{uri: item.imageUrl}} style={styles.thumb} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  info: {flex: 1, gap: 2},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  disabled: {opacity: 0.45},
  pressed: {backgroundColor: colors.surfaceAlt},
});
