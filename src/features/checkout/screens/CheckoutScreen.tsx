import React from 'react';
import {ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Card, EmptyState, Screen, Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {formatCurrency} from '@shared/lib/format';
import {ADDRESS_ROUTES, formatFullAddress} from '@features/address';
import {PaymentMethodList} from '@features/payment';
import {useCheckoutFlow} from '../hooks/use-checkout-flow';
import {useCheckoutStore} from '../store/checkout.store';
import {FeeBreakdownCard} from '../components/FeeBreakdownCard';
import {SelectorRow} from '../components/SelectorRow';
import {CHECKOUT_ROUTES} from '../navigation/checkout.routes';

/**
 * MÀN CHECKOUT.
 *
 * Đếm thử xem có bao nhiêu logic nghiệp vụ ở đây: gần như bằng không.
 * Tính phí, kiểm tra điều kiện, điều phối đặt hàng — tất cả nằm ở
 * model/ và hooks/. Màn hình chỉ đọc kết quả và vẽ.
 *
 * Đó là tiêu chuẩn để tự đánh giá: nếu một màn hình có `if` phức tạp hoặc
 * phép tính về tiền, logic đó đang ở sai chỗ.
 */
export function CheckoutScreen() {
  const navigation = useNavigation();
  const flow = useCheckoutFlow();
  const setPaymentMethod = useCheckoutStore(state => state.setPaymentMethod);
  const setNote = useCheckoutStore(state => state.setNote);

  if (flow.cart.isEmpty) {
    return (
      <Screen>
        <EmptyState
          emoji="🛒"
          title="Giỏ hàng trống"
          actionTitle="Quay lại"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  // Chỉ hiện vấn đề ĐẦU TIÊN — dẫn người dùng đi từng bước thay vì dội
  // cả danh sách lỗi lên đầu họ.
  const firstBlocker = flow.blockers[0];

  return (
    <Screen edgeBottom={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <SelectorRow
          icon="📍"
          title="Giao tới"
          value={flow.address ? formatFullAddress(flow.address) : ''}
          placeholder="Chọn địa chỉ giao hàng"
          onPress={() => navigation.navigate(ADDRESS_ROUTES.AddressPicker)}
        />

        <Card style={styles.block}>
          <Txt variant="bodyStrong">
            {flow.cart.restaurantName} · {flow.cart.itemCount} món
          </Txt>
          {flow.cart.lines.map(line => (
            <View key={line.id} style={styles.itemRow}>
              <Txt variant="body" style={styles.itemQty}>
                {line.quantity}×
              </Txt>
              <View style={styles.itemInfo}>
                <Txt variant="body">{line.name}</Txt>
                {line.optionNames.length > 0 && (
                  <Txt variant="tiny">{line.optionNames.join(', ')}</Txt>
                )}
              </View>
              <Txt variant="body">
                {formatCurrency(line.unitPrice * line.quantity)}
              </Txt>
            </View>
          ))}
        </Card>

        <SelectorRow
          icon="🎟️"
          title="Khuyến mãi"
          value={flow.voucher?.title ?? ''}
          placeholder="Chọn hoặc nhập mã giảm giá"
          onPress={() => navigation.navigate(CHECKOUT_ROUTES.VoucherPicker)}
        />

        <Card style={styles.block}>
          <Txt variant="bodyStrong">Hình thức thanh toán</Txt>
          <PaymentMethodList
            amount={flow.fees.total}
            selected={flow.paymentMethod}
            onSelect={setPaymentMethod}
          />
        </Card>

        <Card style={styles.block}>
          <Txt variant="bodyStrong">Ghi chú cho tài xế</Txt>
          <TextInput
            value={flow.note}
            onChangeText={setNote}
            placeholder="VD: gọi trước khi tới, để ở quầy lễ tân..."
            placeholderTextColor={colors.textMuted}
            style={styles.noteInput}
            multiline
          />
        </Card>

        <FeeBreakdownCard fees={flow.fees} isQuoting={flow.isQuoting} />
      </ScrollView>

      <View style={styles.bottomBar}>
        {!!flow.error && (
          <Txt variant="caption" color={colors.danger} style={styles.error}>
            {flow.error}
          </Txt>
        )}
        {!!firstBlocker && (
          <Txt variant="caption" color={colors.warning} style={styles.error}>
            {firstBlocker.message}
          </Txt>
        )}

        <Button
          title={`Đặt hàng · ${formatCurrency(flow.fees.total)}`}
          onPress={flow.submit}
          disabled={!flow.canPlaceOrder}
          loading={flow.isSubmitting}
          fullWidth
          size="lg"
          testID="place-order"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {padding: spacing.lg, gap: spacing.md, paddingBottom: 140},
  block: {gap: spacing.sm},
  itemRow: {flexDirection: 'row', gap: spacing.md, alignItems: 'center'},
  itemQty: {minWidth: 28},
  itemInfo: {flex: 1, gap: 2},
  noteInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 64,
    textAlignVertical: 'top',
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  error: {textAlign: 'center'},
});
