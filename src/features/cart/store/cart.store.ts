import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {mmkvStorage} from '@core/storage/zustand-persist';
import type {Money} from '@shared/types/money';
import {appEventBus} from '@core/events/app-event-bus';
import * as rules from '../model/cart-rules';
import type {AddToCartInput, Cart} from '../model/types';

/**
 * THE CART STORE — the textbook example of CLIENT STATE.
 *
 * Why the cart does NOT use TanStack Query:
 *   - There is no endpoint to "fetch the cart" from — the app creates it.
 *   - It has to work offline (you can still pick items in a lift).
 *   - It is written to constantly and must respond instantly, with no latency.
 *
 * Look closely and this store contains almost NO logic: each action calls a pure
 * function in model/ and saves the result. That is intentional. Logic in a pure
 * function is easy to test; logic stuffed into the store requires standing the store
 * up just to test it.
 */
interface CartState {
  cart: Cart;

  add: (input: AddToCartInput) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: rules.EMPTY_CART,

      add: input => {
        const current = get().cart;

        // Emit an event when the user switches to shopping at another restaurant.
        // cart does not need to know who cares (analytics? recommendations?) —
        // it only announces a fact that happened.
        if (rules.isDifferentRestaurant(current, input.restaurantId)) {
          appEventBus.emit('cart:restaurant-switched', {
            fromRestaurantId: current.restaurantId as string,
            toRestaurantId: input.restaurantId,
          });
        }

        set({cart: rules.addLine(current, input)});
      },

      setQuantity: (lineId, quantity) =>
        set(state => ({
          cart: rules.updateLineQuantity(state.cart, lineId, quantity),
        })),

      remove: lineId =>
        set(state => ({cart: rules.removeLine(state.cart, lineId)})),

      clear: () => set({cart: rules.EMPTY_CART}),
    }),
    {
      name: 'foodgo.cart',
      storage: createJSONStorage(() => mmkvStorage),
      /**
       * version + migrate: MANDATORY for a persisted store.
       *
       * The user updates the app but the old data is still on their device. If you
       * change the shape of CartLine without bumping the version, the app reads the
       * old data and crashes on the first launch after the update — a bug that is
       * extremely hard to reproduce on a dev machine, which always installs fresh.
       */
      version: 1,
      migrate: (persisted, fromVersion) => {
        if (fromVersion === 0) {
          // The v0 schema is too different -> dropping the old cart beats crashing.
          return {cart: rules.EMPTY_CART};
        }
        return persisted as {cart: Cart};
      },
    },
  ),
);

/* ------------------------------ SELECTORS -------------------------------- */

/**
 * ⭐ PRIMITIVE SELECTORS — a small detail with a large effect on performance.
 *
 * `useCartStore(selectItemCount)` returns a number. Zustand compares with Object.is,
 * so the component ONLY re-renders when that number actually changes.
 *
 * Write `useCartStore(s => ({count: ..., total: ...}))` instead and every time anything
 * in the store changes, the selector builds a NEW object -> Object.is is false ->
 * a pointless re-render. With the cart badge on every screen, that mistake re-renders
 * the whole app each time the user types a note.
 */
export const selectItemCount = (state: CartState): number =>
  rules.countItems(state.cart);

/**
 * Returns `Money`, not `number`.
 *
 * With `number`, the branded type is "dropped" right at the selector and every function
 * downstream (calcDiscount, calcOrderTotal, validateCheckout) receives a bare number —
 * losing all the protection Money provides. A branded type only works when it is kept
 * intact the whole way through.
 */
export const selectSubtotal = (state: CartState): Money =>
  rules.calcSubtotal(state.cart);

export const selectIsEmpty = (state: CartState): boolean =>
  rules.isEmpty(state.cart);

export const selectLines = (state: CartState) => state.cart.lines;
export const selectRestaurantId = (state: CartState) => state.cart.restaurantId;
export const selectRestaurantName = (state: CartState) =>
  state.cart.restaurantName;
