import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Badge, Card, Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {formatCurrency} from '@shared/lib/format';
import type {Money} from '@shared/types/money';
import {calcDiscount, checkEligibility} from '../model/voucher-rules';
import type {Voucher} from '../model/types';

interface VoucherCardProps {
  voucher: Voucher;
  subtotal: Money;
  deliveryFee: Money;
  restaurantId: string | null;
  selected: boolean;
  onPress: () => void;
}

/**
 * The voucher card — exported through the public API so checkout can reuse it.
 *
 * It works out whether the voucher is usable itself instead of taking a `disabled`
 * flag from outside. The reason: that rule belongs to promotion. Make checkout pass
 * it in and one day another screen will pass the wrong value and the two will disagree.
 */
export function VoucherCard({
  voucher,
  subtotal,
  deliveryFee,
  restaurantId,
  selected,
  onPress,
}: VoucherCardProps) {
  const eligibility = checkEligibility(voucher, {subtotal, restaurantId});
  const discount = calcDiscount(voucher, {subtotal, deliveryFee, restaurantId});

  return (
    <Card
      onPress={eligibility.eligible ? onPress : undefined}
      testID={`voucher-${voucher.id}`}
      style={[
        styles.card,
        selected && styles.selected,
        !eligibility.eligible && styles.disabled,
      ]}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Txt variant="bodyStrong">{voucher.title}</Txt>
          <Txt variant="caption">{voucher.description}</Txt>

          <View style={styles.badgeRow}>
            <Badge label={voucher.code} />
            {eligibility.eligible ? (
              <Txt variant="tiny" color={colors.success}>
                Giảm {formatCurrency(discount)}
              </Txt>
            ) : (
              <Txt variant="tiny" color={colors.danger}>
                {eligibility.message}
              </Txt>
            )}
          </View>
        </View>

        {selected && (
          <Txt variant="h3" color={colors.primary}>
            ✓
          </Txt>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {padding: spacing.md},
  row: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  info: {flex: 1, gap: 2},
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  selected: {borderColor: colors.primary, backgroundColor: colors.primarySoft},
  disabled: {opacity: 0.5},
});
