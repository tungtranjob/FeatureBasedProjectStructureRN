import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {Card, Divider, LabelValueRow, Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {formatCurrency} from '@shared/lib/format';
import type {FeeBreakdown} from '@features/order';

interface FeeBreakdownCardProps {
  fees: FeeBreakdown;
  /** Waiting for the official quote from the server. */
  isQuoting: boolean;
}

export function FeeBreakdownCard({fees, isQuoting}: FeeBreakdownCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Txt variant="bodyStrong">Chi tiết thanh toán</Txt>
        {/* A small indicator instead of covering the card with a spinner: the user can
            still read the provisional total while the server confirms it. */}
        {isQuoting && <ActivityIndicator size="small" color={colors.textMuted} />}
      </View>

      <LabelValueRow label="Tạm tính" value={formatCurrency(fees.subtotal)} />
      <LabelValueRow
        label="Phí giao hàng"
        value={formatCurrency(fees.deliveryFee)}
      />
      <LabelValueRow
        label="Phí dịch vụ"
        value={formatCurrency(fees.serviceFee)}
      />
      {fees.discount > 0 && (
        <LabelValueRow
          label="Giảm giá"
          value={`−${formatCurrency(fees.discount)}`}
          valueColor={colors.success}
        />
      )}

      <Divider />

      <LabelValueRow
        label="Tổng cộng"
        value={formatCurrency(fees.total)}
        strong
        valueColor={colors.primary}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {gap: 2},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
});
