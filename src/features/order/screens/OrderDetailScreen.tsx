import React from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {useRoute, type RouteProp} from '@react-navigation/native';
import {
  Button,
  Card,
  Divider,
  ErrorView,
  LabelValueRow,
  Screen,
  Skeleton,
  Txt,
} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {formatCurrency, formatDateTime} from '@shared/lib/format';
import {toUserMessage} from '@shared/errors/app-error';
import {formatFullAddress} from '@features/address';
import {getMethodInfo} from '@features/payment';
import {useCancelOrder, useOrder} from '../api/order.queries';
import {canCancelOrder, getEstimatedArrival} from '../model/order-rules';
import {OrderProgress} from '../components/OrderProgress';
import {OrderStatusChip} from '../components/OrderStatusChip';
import type {OrderStackParamList} from '../navigation/order.routes';

type DetailRoute = RouteProp<OrderStackParamList, 'OrderDetail'>;

export function OrderDetailScreen() {
  const {params} = useRoute<DetailRoute>();
  // Query này TỰ ĐỘNG hỏi lại mỗi 10 giây khi đơn còn đang chạy
  // (xem refetchInterval trong order.queries.ts) -> màn hình tự cập nhật.
  const {data: order, isPending, error, refetch} = useOrder(params.orderId);
  const cancelOrder = useCancelOrder();

  if (isPending) {
    return (
      <Screen>
        <View style={styles.skeleton}>
          <Skeleton height={80} />
          <Skeleton height={120} />
          <Skeleton height={200} />
        </View>
      </Screen>
    );
  }

  if (error || !order) {
    return (
      <Screen>
        <ErrorView error={error} onRetry={refetch} />
      </Screen>
    );
  }

  const handleCancel = () => {
    Alert.alert('Huỷ đơn hàng?', 'Thao tác này không thể hoàn tác.', [
      {text: 'Không', style: 'cancel'},
      {
        text: 'Huỷ đơn',
        style: 'destructive',
        onPress: () =>
          cancelOrder.mutate(order.id, {
            onError: e => Alert.alert('Không huỷ được', toUserMessage(e)),
          }),
      },
    ]);
  };

  const methodInfo = getMethodInfo(order.paymentMethod);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.block}>
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <Txt variant="h3">{order.restaurant.name}</Txt>
              <Txt variant="tiny">
                {order.code} · {formatDateTime(order.placedAt)}
              </Txt>
            </View>
            <OrderStatusChip status={order.status} />
          </View>

          <OrderProgress status={order.status} />

          {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
            <Txt variant="caption" style={styles.eta}>
              Dự kiến giao lúc{' '}
              {getEstimatedArrival(order).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Txt>
          )}
        </Card>

        <Card style={styles.block}>
          <Txt variant="bodyStrong">Giao tới</Txt>
          <Txt variant="caption">{formatFullAddress(order.address)}</Txt>
          <Txt variant="tiny">
            {order.address.recipientName} · {order.address.phone}
          </Txt>
        </Card>

        <Card style={styles.block}>
          <Txt variant="bodyStrong">Món đã đặt</Txt>
          {order.items.map((item, index) => (
            <View key={`${item.menuItemId}-${index}`}>
              {index > 0 && <Divider />}
              <View style={styles.itemRow}>
                <Txt variant="body" style={styles.itemQty}>
                  {item.quantity}×
                </Txt>
                <View style={styles.itemInfo}>
                  <Txt variant="body">{item.name}</Txt>
                  {item.optionNames.length > 0 && (
                    <Txt variant="tiny">{item.optionNames.join(', ')}</Txt>
                  )}
                  {!!item.note && <Txt variant="tiny">Ghi chú: {item.note}</Txt>}
                </View>
                <Txt variant="body">{formatCurrency(item.lineTotal)}</Txt>
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.block}>
          <Txt variant="bodyStrong">Thanh toán</Txt>
          <LabelValueRow
            label="Tạm tính"
            value={formatCurrency(order.fees.subtotal)}
          />
          <LabelValueRow
            label="Phí giao hàng"
            value={formatCurrency(order.fees.deliveryFee)}
          />
          <LabelValueRow
            label="Phí dịch vụ"
            value={formatCurrency(order.fees.serviceFee)}
          />
          {order.fees.discount > 0 && (
            <LabelValueRow
              label="Giảm giá"
              value={`−${formatCurrency(order.fees.discount)}`}
              valueColor={colors.success}
            />
          )}
          <Divider />
          <LabelValueRow
            label="Tổng cộng"
            value={formatCurrency(order.fees.total)}
            strong
            valueColor={colors.primary}
          />
          <Txt variant="tiny" style={styles.method}>
            {methodInfo.icon} {methodInfo.label}
            {order.paymentStatus === 'PAID' ? ' · Đã thanh toán' : ''}
            {order.paymentStatus === 'REFUNDED' ? ' · Đã hoàn tiền' : ''}
          </Txt>
        </Card>

        {canCancelOrder(order) && (
          <Button
            title="Huỷ đơn hàng"
            variant="danger"
            onPress={handleCancel}
            loading={cancelOrder.isPending}
            style={styles.cancelButton}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {padding: spacing.lg, gap: spacing.md},
  block: {gap: spacing.xs},
  headerRow: {flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm},
  headerInfo: {flex: 1, gap: 2},
  eta: {textAlign: 'center'},
  itemRow: {flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm},
  itemQty: {minWidth: 28},
  itemInfo: {flex: 1, gap: 2},
  method: {marginTop: spacing.sm},
  cancelButton: {marginTop: spacing.sm},
  skeleton: {padding: spacing.lg, gap: spacing.md},
});
