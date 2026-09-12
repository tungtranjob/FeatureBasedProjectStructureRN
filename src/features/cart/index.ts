/**
 * PUBLIC API CỦA FEATURE CART.
 *
 * ⚠️ `useCartStore` KHÔNG nằm ở đây, và đó là điều quan trọng nhất của file này.
 *
 * Nếu feature khác chạm được vào store, sớm muộn sẽ có người gọi
 * `useCartStore.setState({cart: ...})` từ màn hình checkout để "sửa nhanh
 * một chút". Lúc đó các quy tắc trong cart-rules.ts bị đi vòng, và không ai
 * còn dám khẳng định giỏ hàng luôn ở trạng thái hợp lệ.
 *
 * Ngoại lệ: `getCartSnapshot` và `clearCart` cho code ngoài React tree
 * (app/bootstrap cần xoá giỏ sau khi thanh toán thành công).
 */
export {CartFab} from './components/CartFab';
export {CartScreen} from './screens/CartScreen';
export {CART_ROUTES} from './navigation/cart.routes';
export type {CartStackParamList} from './navigation/cart.routes';
export {useCart, useCartBadge, useAddToCart} from './hooks/use-cart';
export type {Cart, CartLine, AddToCartInput} from './model/types';

import {useCartStore} from './store/cart.store';
import type {Cart} from './model/types';

/** Đọc giỏ hàng ngoài React tree (VD: trong event handler ở bootstrap). */
export const getCartSnapshot = (): Cart => useCartStore.getState().cart;

/** Xoá giỏ hàng ngoài React tree. */
export const clearCart = (): void => useCartStore.getState().clear();
