/**
 * THE CART FEATURE'S PUBLIC API.
 *
 * ⚠️ `useCartStore` is NOT here, and that is the most important thing about this file.
 *
 * If another feature could reach the store, sooner or later somebody would call
 * `useCartStore.setState({cart: ...})` from the checkout screen as a "quick little
 * fix". At that point the rules in cart-rules.ts are bypassed, and nobody can claim
 * the cart is always in a valid state any more.
 *
 * Exceptions: `getCartSnapshot` and `clearCart` for code outside the React tree
 * (app/bootstrap needs to clear the cart after a successful payment).
 */
export {CartFab} from './components/CartFab';
export {CartScreen} from './screens/CartScreen';
export {CART_ROUTES} from './navigation/cart.routes';
export type {CartStackParamList} from './navigation/cart.routes';
export {useCart, useCartBadge, useAddToCart} from './hooks/use-cart';
export type {Cart, CartLine, AddToCartInput} from './model/types';

import {useCartStore} from './store/cart.store';
import type {Cart} from './model/types';

/** Reads the cart outside the React tree (e.g. in a bootstrap event handler). */
export const getCartSnapshot = (): Cart => useCartStore.getState().cart;

/** Clears the cart outside the React tree. */
export const clearCart = (): void => useCartStore.getState().clear();
