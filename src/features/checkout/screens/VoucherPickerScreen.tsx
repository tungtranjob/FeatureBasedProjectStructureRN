import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, EmptyState, Screen, Txt} from '@shared/ui';
import {spacing} from '@shared/theme';
import {money} from '@shared/types/money';
import {sortVouchersForDisplay, VoucherCard} from '@features/promotion';
import {useCheckoutDraft} from '../hooks/use-checkout-draft';
import {useCheckoutStore} from '../store/checkout.store';

/**
 * MÀN CHỌN VOUCHER — thuộc feature CHECKOUT, không phải PROMOTION.
 *
 * Lý do phân chia như vậy:
 *   promotion = "voucher là gì, dùng được không, giảm bao nhiêu" (dữ liệu
 *               + quy tắc + component VoucherCard).
 *   checkout  = "người dùng đang chọn voucher nào cho ĐƠN HÀNG NÀY" (state
 *               của luồng checkout).
 *
 * Nếu đặt màn hình này trong promotion, nó sẽ phải ghi vào checkout store —
 * tức là promotion phụ thuộc ngược lại checkout, tạo phụ thuộc vòng.
 * Đặt ở checkout thì chiều phụ thuộc sạch sẽ: checkout -> promotion.
 */
export function VoucherPickerScreen() {
  const navigation = useNavigation();
  const draft = useCheckoutDraft();
  const setVoucher = useCheckoutStore(state => state.setVoucher);

  const sorted = sortVouchersForDisplay(draft.vouchers, {
    subtotal: draft.cart.subtotal,
    deliveryFee: draft.restaurant?.deliveryFee ?? money(0),
    restaurantId: draft.cart.restaurantId,
  });

  if (sorted.length === 0) {
    return (
      <Screen>
        <EmptyState emoji="🎟️" title="Chưa có khuyến mãi nào" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.list}>
        <Txt variant="caption">
          Voucher không dùng được sẽ hiển thị mờ kèm lý do.
        </Txt>

        {sorted.map(voucher => (
          <VoucherCard
            key={voucher.id}
            voucher={voucher}
            subtotal={draft.cart.subtotal}
            deliveryFee={draft.restaurant?.deliveryFee ?? money(0)}
            restaurantId={draft.cart.restaurantId}
            selected={draft.voucher?.id === voucher.id}
            onPress={() => {
              setVoucher(voucher.id);
              navigation.goBack();
            }}
          />
        ))}

        {!!draft.voucher && (
          <Button
            title="Bỏ chọn voucher"
            variant="ghost"
            onPress={() => {
              setVoucher(null);
              navigation.goBack();
            }}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {padding: spacing.lg, gap: spacing.md},
});
