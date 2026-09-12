import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Card, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {formatCurrency, formatDateTime} from '@shared/lib/format';
import {OrderStatusChip} from './OrderStatusChip';
import type {Order} from '../model/types';

export function OrderCard({order, onPress}: {order: Order; onPress: () => void}) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card onPress={onPress} testID={`order-${order.id}`} style={styles.card}>
      <View style={styles.row}>
        <Image source={{uri: order.restaurant.imageUrl}} style={styles.thumb} />

        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Txt variant="bodyStrong" numberOfLines={1} style={styles.name}>
              {order.restaurant.name}
            </Txt>
            <OrderStatusChip status={order.status} />
          </View>

          <Txt variant="caption" numberOfLines={1}>
            {order.items.map(item => item.name).join(', ')}
          </Txt>

          <View style={styles.footerRow}>
            <Txt variant="tiny">
              {order.code} · {itemCount} món · {formatDateTime(order.placedAt)}
            </Txt>
            <Txt variant="bodyStrong" color={colors.primary}>
              {formatCurrency(order.fees.total)}
            </Txt>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {padding: spacing.md},
  row: {flexDirection: 'row', gap: spacing.md},
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  info: {flex: 1, gap: 4},
  headerRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  name: {flex: 1},
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
