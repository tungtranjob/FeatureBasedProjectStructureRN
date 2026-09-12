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
 * The hook for reading the cart.
 *
 * Each value comes from ONE useCartStore call with a primitive selector.
 * It looks more verbose than a single combined selector, but this is the right way:
 * a component only re-renders for the exact piece of data it uses.
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

/** Just the item count — for the badge, where re-renders must be as rare as possible. */
export function useCartBadge(): number {
  return useCartStore(selectItemCount);
}

/**
 * Adds an item to the cart, handling the "switch restaurant" case.
 *
 * ⭐ The split of responsibilities here is worth noting:
 *    - model/cart-rules.ts DECIDES the outcome (replace the cart).
 *    - this hook handles the INTERACTION (ask the user before losing the old cart).
 *    - the store only SAVES the result.
 *
 * Putting the Alert inside the store would be wrong: the store would no longer be
 * testable outside React Native, and you could not reuse that logic for a "quick add"
 * flow that asks nothing.
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
