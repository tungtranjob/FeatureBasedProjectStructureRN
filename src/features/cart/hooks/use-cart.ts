import {Alert} from 'react-native';
import {useCallback} from 'react';
import {
  selectIsEmpty,
  selectItemCount,
  selectLines,
  selectRestaurantId,
  selectRestaurantName,
  selectSubtotal,
  useCartStore,
} from '../store/cart.store';
import {isDifferentRestaurant} from '../model/cart-rules';
import type {AddToCartInput} from '../model/types';

/**
 * Hook đọc giỏ hàng.
 *
 * Mỗi giá trị lấy bằng MỘT lần gọi useCartStore với selector nguyên thuỷ.
 * Trông có vẻ dài dòng hơn một selector gộp, nhưng đây mới là cách đúng:
 * component chỉ re-render theo đúng mẩu dữ liệu nó dùng.
 */
export function useCart() {
  const lines = useCartStore(selectLines);
  const itemCount = useCartStore(selectItemCount);
  const subtotal = useCartStore(selectSubtotal);
  const isEmpty = useCartStore(selectIsEmpty);
  const restaurantId = useCartStore(selectRestaurantId);
  const restaurantName = useCartStore(selectRestaurantName);

  const setQuantity = useCartStore(state => state.setQuantity);
  const remove = useCartStore(state => state.remove);
  const clear = useCartStore(state => state.clear);

  return {
    lines,
    itemCount,
    subtotal,
    isEmpty,
    restaurantId,
    restaurantName,
    setQuantity,
    remove,
    clear,
  };
}

/** Chỉ lấy số lượng — dùng cho badge, nơi cần re-render ít nhất có thể. */
export function useCartBadge(): number {
  return useCartStore(selectItemCount);
}

/**
 * Thêm món vào giỏ, có xử lý tình huống "đổi nhà hàng".
 *
 * ⭐ Ranh giới trách nhiệm ở đây rất đáng chú ý:
 *    - model/cart-rules.ts QUYẾT ĐỊNH kết quả (thay giỏ mới).
 *    - hook này lo phần TƯƠNG TÁC (hỏi người dùng trước khi mất giỏ cũ).
 *    - store chỉ LƯU kết quả.
 *
 * Nhét Alert vào trong store là sai: store sẽ không test được ngoài môi
 * trường React Native, và bạn không thể tái dùng logic đó cho một luồng
 * "thêm nhanh" không cần hỏi.
 */
export function useAddToCart() {
  const add = useCartStore(state => state.add);

  return useCallback(
    (input: AddToCartInput) => {
      const {cart} = useCartStore.getState();

      if (!isDifferentRestaurant(cart, input.restaurantId)) {
        add(input);
        return;
      }

      Alert.alert(
        'Bắt đầu giỏ hàng mới?',
        `Giỏ của bạn đang có món từ "${cart.restaurantName}". Thêm món từ "${input.restaurantName}" sẽ xoá các món cũ.`,
        [
          {text: 'Huỷ', style: 'cancel'},
          {text: 'Tạo giỏ mới', style: 'destructive', onPress: () => add(input)},
        ],
      );
    },
    [add],
  );
}
