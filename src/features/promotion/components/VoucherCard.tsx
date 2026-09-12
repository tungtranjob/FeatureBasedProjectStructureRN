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
 * Thẻ voucher — export ra public API để feature checkout tái sử dụng.
 *
 * Nó tự tính xem voucher có dùng được không thay vì nhận cờ `disabled` từ
 * ngoài. Lý do: quy tắc đó thuộc về promotion. Nếu bắt checkout truyền vào,
 * một ngày nào đó sẽ có màn hình khác truyền sai và hai chỗ hiển thị khác nhau.
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
