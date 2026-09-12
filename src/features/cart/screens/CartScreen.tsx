import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Button, Divider, EmptyState, LabelValueRow, Screen, Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {formatCurrency} from '@shared/lib/format';
import {useCart} from '../hooks/use-cart';
import {CartLineRow} from '../components/CartLineRow';

/**
 * The cart screen.
 *
 * Note: it shows ONLY the subtotal, with no delivery fee and no discount.
 * Why? The delivery fee depends on the restaurant and the discount depends on the
 * voucher — both belong to checkout. The cart keeps its scope deliberately narrow:
 * it only knows "which items, how many of each".
 *
 * Keeping the scope that narrow is why the cart works offline and does not depend
 * on the promotion or checkout features.
 */
export function CartScreen() {
  const navigation = useNavigation();
  const {lines, subtotal, isEmpty, restaurantName, setQuantity, remove, clear} =
    useCart();

  if (isEmpty) {
    return (
      <Screen>
        <EmptyState
          emoji="🛒"
          title="Giỏ hàng trống"
          description="Chọn vài món ngon để bắt đầu nhé."
          actionTitle="Khám phá nhà hàng"
          onAction={() => navigation.goBack()}
        />
      </Screen>
    );
  }

  return (
    <Screen edgeBottom={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Txt variant="caption">Đặt món từ</Txt>
          <Txt variant="h3">{restaurantName}</Txt>
        </View>

        {lines.map((line, index) => (
          <View key={line.id}>
            {index > 0 && <Divider inset={spacing.lg} />}
            <CartLineRow
              line={line}
              onChangeQuantity={quantity => setQuantity(line.id, quantity)}
              onRemove={() => remove(line.id)}
            />
          </View>
        ))}

        <View style={styles.summary}>
          <LabelValueRow
            label="Tạm tính"
            value={formatCurrency(subtotal)}
            strong
          />
          <Txt variant="tiny">
            Phí giao hàng và khuyến mãi sẽ được tính ở bước thanh toán.
          </Txt>
        </View>

        <Button
          title="Xoá toàn bộ giỏ hàng"
          variant="ghost"
          onPress={clear}
          style={styles.clear}
        />
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={`Tiếp tục · ${formatCurrency(subtotal)}`}
          onPress={() => navigation.navigate('Checkout')}
          fullWidth
          size="lg"
          testID="cart-continue"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {paddingBottom: 120},
  header: {padding: spacing.lg, backgroundColor: colors.surface, gap: 2},
  summary: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  clear: {marginTop: spacing.md},
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
