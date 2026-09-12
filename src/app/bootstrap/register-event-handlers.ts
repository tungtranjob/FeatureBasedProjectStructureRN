import {appEventBus} from '@core/events/app-event-bus';
import {queryClient} from '@core/api/query-client';
import {logger} from '@core/logger/logger';
import {clearCart} from '@features/cart';
import {orderKeys} from '@features/order';
import {resetCheckoutDraft} from '@features/checkout';
import {resetSelectedAddress} from '@features/address';
import {navigate} from '../navigation/navigation.service';

/**
 * ⭐⭐ THE MOST IMPORTANT FILE FOR UNDERSTANDING THIS ARCHITECTURE.
 *
 * This is the ONLY place where features are "wired" to each other. Reading this file
 * tells you how the app reacts to the big events without opening 8 feature
 * directories.
 *
 * Notice what does NOT happen inside the features:
 *   - payment does NOT call cart.clear(). It only emits 'payment:succeeded'.
 *   - auth does NOT call resetCheckoutDraft(). It only emits 'auth:logged-out'.
 *   - order does NOT know who cares about a new order.
 *
 * The result: any feature can be deleted without breaking the others. Want new
 * behaviour when a payment succeeds (send analytics, show a rating prompt, award
 * loyalty points)? Add a line here. Do not touch payment.
 *
 * The trade-off to know about: the flow is harder to trace than a direct call —
 * you cannot "Go to definition" from the emitter to the handler. That is why the
 * number of events must stay small and all of them live in one file like this.
 */
export function registerEventHandlers(): () => void {
  const unsubscribers: Array<() => void> = [];

  /* ------------------- Order placed successfully ------------------- */
  unsubscribers.push(
    appEventBus.on('order:placed', ({orderId, orderCode}) => {
      logger.info('App', `Đã tạo đơn ${orderCode}`);

      // The cart is cleared HERE, not inside checkout.
      // checkout does not need to know that cart exists.
      clearCart();
      resetCheckoutDraft();

      void queryClient.invalidateQueries({queryKey: orderKeys.lists()});

      // Where analytics would be hooked in:
      // analytics.track('order_placed', {orderId, orderCode});
      void orderId;
    }),
  );

  /* ----------------------- Payment succeeded ----------------------- */
  unsubscribers.push(
    appEventBus.on('payment:succeeded', ({orderId}) => {
      logger.info('App', `Thanh toán thành công cho đơn ${orderId}`);

      // Refresh the orders so the status is up to date the moment the user sees it.
      void queryClient.invalidateQueries({queryKey: orderKeys.detail(orderId)});
      void queryClient.invalidateQueries({queryKey: orderKeys.lists()});

      // The cart should already be empty from 'order:placed', but clear it again to be safe:
      // this payment may be a retry of an older, pending order.
      clearCart();
    }),
  );

  /* ------------------------ Payment failed ------------------------- */
  unsubscribers.push(
    appEventBus.on('payment:failed', ({orderId, reason}) => {
      logger.warn('App', `Thanh toán thất bại: ${reason}`);
      void queryClient.invalidateQueries({queryKey: orderKeys.detail(orderId)});
      // Do NOT clear the cart: the user may want to retry with another method.
    }),
  );

  /* -------------------------- Logged out --------------------------- */
  unsubscribers.push(
    appEventBus.on('auth:logged-out', () => {
      logger.info('App', 'Người dùng đăng xuất — dọn toàn bộ dữ liệu cá nhân');

      // Clear each feature's CLIENT STATE through its public API.
      clearCart();
      resetCheckoutDraft();
      resetSelectedAddress();

      // Clear SERVER STATE: wipe the cache, otherwise the next user to sign in
      // on the same device sees the previous user's orders.
      // This is a common security bug and very easy to miss.
      queryClient.clear();
    }),
  );

  /* ---------------- Restaurant changed in the cart ----------------- */
  unsubscribers.push(
    appEventBus.on('cart:restaurant-switched', ({toRestaurantId}) => {
      // The old voucher belongs to the old restaurant -> it is no longer valid.
      resetCheckoutDraft();
      void toRestaurantId;
    }),
  );

  /* ----------------- Payment cancelled by the user ----------------- */
  unsubscribers.push(
    appEventBus.on('payment:cancelled', ({orderId}) => {
      // Send the user back to the pending order instead of leaving them stranded.
      navigate('OrderDetail', {orderId});
    }),
  );

  // Return a cleanup function: needed for Fast Refresh in dev, otherwise listeners
  // double up after every edit and you see behaviour running twice.
  return () => unsubscribers.forEach(unsubscribe => unsubscribe());
}
