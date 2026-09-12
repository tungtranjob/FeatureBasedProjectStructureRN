import {useCallback, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {generateId} from '@shared/lib/id';
import {toUserMessage} from '@shared/errors/app-error';
import {logger} from '@core/logger/logger';
import {usePlaceOrder} from '@features/order';
import {PAYMENT_ROUTES, useInitiatePayment} from '@features/payment';
import {ORDER_ROUTES} from '@features/order';
import {useCheckoutDraft} from './use-checkout-draft';
import {useCheckoutStore} from '../store/checkout.store';

/**
 * ⭐ ORCHESTRATES THE ENTIRE ORDERING FLOW.
 *
 * The flow:
 *   1. Generate an idempotency key (one per ordering attempt).
 *   2. POST /orders  -> returns the order + paymentIntent (null for COD).
 *   3a. COD          -> go straight to the order detail screen.
 *   3b. Non-COD      -> start the provider, go to the payment waiting screen.
 *
 * All of the orchestration lives HERE, not in CheckoutScreen. That leaves the screen
 * with nothing but rendering, and makes this flow reusable for "reorder" or for
 * re-paying a pending order.
 */
export function useCheckoutFlow() {
  const navigation = useNavigation();
  const draft = useCheckoutDraft();
  const placeOrder = usePlaceOrder();
  const {pay} = useInitiatePayment();
  const resetCheckout = useCheckoutStore(state => state.reset);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * ⭐ THE IDEMPOTENCY KEY stays the same across every RETRY of the same
   * order.
   *
   * The scenario it saves you from: the user taps "Đặt hàng", the request reaches the
   * server, the server creates the order, then the connection drops before the response
   * arrives. The app reports an error and the user taps again. A new key -> two orders
   * and two charges. The same key -> the server recognises it and returns the original order.
   *
   * The key is only regenerated after a SUCCESSFUL order (a genuinely new one).
   */
  const idempotencyKey = useRef(generateId('idem'));

  const submit = useCallback(async () => {
    if (!draft.canPlaceOrder || !draft.address || !draft.cart.restaurantId) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      /* ---- Step 1: create the order ---- */
      const result = await placeOrder.mutateAsync({
        restaurantId: draft.cart.restaurantId,
        items: draft.cart.lines.map(line => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          optionIds: line.optionIds,
          note: line.note,
        })),
        addressId: draft.address.id,
        voucherId: draft.voucher?.id ?? null,
        paymentMethod: draft.paymentMethod,
        idempotencyKey: idempotencyKey.current,
      });

      // Order placed -> the next one must use a fresh key.
      idempotencyKey.current = generateId('idem');
      resetCheckout();

      /* ---- Step 2: COD is done here ---- */
      if (!result.paymentIntent) {
        // The cart is cleared in app/bootstrap when it hears the 'order:placed' event.
        // checkout does NOT call cart.clear() itself — it need not know cart exists.
        navigation.reset({
          index: 1,
          routes: [
            {name: 'MainTabs'},
            {
              name: ORDER_ROUTES.OrderDetail,
              params: {orderId: result.order.id},
            },
          ],
        });
        return;
      }

      /* ---- Step 3: start the payment gateway ---- */
      // Navigate BEFORE calling pay(): pay() may push the app to the background
      // immediately, and we want the waiting screen ready when the user comes back.
      navigation.navigate(PAYMENT_ROUTES.PaymentProcessing, {
        intentId: result.paymentIntent.id,
        orderId: result.order.id,
        orderCode: result.order.code,
      });

      await pay(result.paymentIntent);
    } catch (caught) {
      logger.error('Checkout', 'Đặt hàng thất bại', caught);
      setError(toUserMessage(caught));
    } finally {
      setIsSubmitting(false);
    }
  }, [draft, placeOrder, pay, navigation, resetCheckout]);

  return {
    ...draft,
    submit,
    isSubmitting: isSubmitting || placeOrder.isPending,
    error,
    clearError: () => setError(null),
  };
}
