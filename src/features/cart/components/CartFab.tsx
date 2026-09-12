import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {formatCurrency} from '@shared/lib/format';
import {useCartStore, selectItemCount, selectSubtotal} from '../store/cart.store';
import {CART_ROUTES} from '../navigation/cart.routes';

/**
 * Nút giỏ hàng nổi, hiện trên mọi màn hình mua sắm.
 *
 * ⭐ Component này TỰ ĐỌC store thay vì nhận props.
 *
 * Đó là quyết định có chủ đích: nếu nhận props, mọi màn hình nhúng nó đều
 * phải subscribe vào cart store và re-render theo — tức là cả FlatList
 * hàng trăm dòng cũng render lại chỉ vì badge đổi số. Đọc store tại chỗ
 * khoanh vùng re-render lại đúng trong component này.
 */
export function CartFab() {
  const navigation = useNavigation();
  const itemCount = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectSubtotal);

  if (itemCount === 0) {
    return null;
  }

  return (
    <Pressable
      onPress={() => navigation.navigate(CART_ROUTES.Cart)}
      testID="cart-fab"
      style={({pressed}) => [styles.fab, pressed && styles.pressed]}>
      <View style={styles.badge}>
        <Txt variant="tiny" color={colors.primary}>
          {itemCount}
        </Txt>
      </View>
      <Txt variant="bodyStrong" color={colors.textInverse} style={styles.label}>
        Xem giỏ hàng
      </Txt>
      <Txt variant="bodyStrong" color={colors.textInverse}>
        {formatCurrency(subtotal)}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },
  pressed: {opacity: 0.9},
  badge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {flex: 1},
});
