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
 * THE VOUCHER PICKER — it belongs to CHECKOUT, not PROMOTION.
 *
 * The reason for the split:
 *   promotion = "what a voucher is, whether it is usable, how much it saves" (the data
 *               + rules + the VoucherCard component).
 *   checkout  = "which voucher the user is picking for THIS ORDER" (the state of the
 *               checkout flow).
 *
 * If this screen lived in promotion, it would have to write into the checkout store —
 * meaning promotion depends back on checkout, creating a dependency cycle.
 * Keeping it in checkout leaves the direction clean: checkout -> promotion.
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
