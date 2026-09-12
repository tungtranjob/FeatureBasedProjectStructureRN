import {useEffect, useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {money} from '@shared/types/money';
// ⭐ CHECKOUT IS THE MEETING POINT: it imports 5 other features.
// That is NORMAL and CORRECT — checkout exists precisely to join them together.
// The reverse is never allowed: cart must not import checkout.
import {useCart} from '@features/cart';
import {useDeliveryAddress} from '@features/address';
import {calcDiscount, useVouchers} from '@features/promotion';
import {getAvailability, useRestaurant} from '@features/restaurant';
import {getCurrentPlatform, resolveValidMethod} from '@features/payment';
import {orderApi, type FeeBreakdown} from '@features/order';
import {calcOrderTotal, EMPTY_FEES} from '../model/calc-order-total';
import {validateCheckout} from '../model/validate-checkout';
import {useCheckoutStore} from '../store/checkout.store';

/**
 * Gathers all the data the checkout screen needs.
 *
 * This hook does 4 things: collect data from the features, compute provisional fees
 * (client-side), reconcile with the server's quote, and validate the order conditions.
 */
export function useCheckoutDraft() {
  const cart = useCart();
  const {address} = useDeliveryAddress();
  const {data: restaurant} = useRestaurant(cart.restaurantId ?? undefined);
  const {data: vouchers} = useVouchers(cart.restaurantId);

  const voucherId = useCheckoutStore(state => state.voucherId);
  const paymentMethod = useCheckoutStore(state => state.paymentMethod);
  const setPaymentMethod = useCheckoutStore(state => state.setPaymentMethod);
  const note = useCheckoutStore(state => state.note);

  const voucher = useMemo(
    () => vouchers?.find(item => item.id === voucherId) ?? null,
    [vouchers, voucherId],
  );

  const deliveryFee = restaurant?.deliveryFee ?? money(0);

  const discount = useMemo(
    () =>
      calcDiscount(voucher, {
        subtotal: cart.subtotal,
        deliveryFee,
        restaurantId: cart.restaurantId,
      }),
    [voucher, cart.subtotal, deliveryFee, cart.restaurantId],
  );

  /* ---- 1. A quick client-side calculation so the UI responds instantly ---- */
  const localFees = useMemo<FeeBreakdown>(
    () =>
      cart.isEmpty
        ? EMPTY_FEES
        : calcOrderTotal({subtotal: cart.subtotal, deliveryFee, discount}),
    [cart.isEmpty, cart.subtotal, deliveryFee, discount],
  );

  /* ---- 2. Ask the server for the official quote ---- */
  const quote = useQuery({
    queryKey: ['checkout-quote', cart.restaurantId, cart.subtotal, voucherId],
    queryFn: () =>
      orderApi.quote({
        restaurantId: cart.restaurantId as string,
        subtotal: cart.subtotal,
        voucherId,
      }),
    enabled: Boolean(cart.restaurantId) && !cart.isEmpty,
    /**
     * Keep the previous data when the query key changes, instead of flashing back to
     * a loading state. A user changing the voucher sees the old numbers dim and then
     * update, rather than the whole breakdown disappearing and reappearing.
     */
    placeholderData: previous => previous,
    retry: 1,
  });

  /* ---- 3. The server wins once its result arrives ---- */
  const fees = quote.data ?? localFees;

  /* ---- 4. Validate the order conditions ---- */
  const isRestaurantOpen = restaurant
    ? getAvailability(restaurant) === 'open'
    : true; // still loading -> do not report an error yet

  const blockers = useMemo(
    () =>
      validateCheckout({
        itemCount: cart.itemCount,
        hasAddress: Boolean(address),
        isRestaurantOpen,
        subtotal: cart.subtotal,
        minOrderAmount: restaurant?.minOrderAmount ?? money(0),
      }),
    [cart.itemCount, cart.subtotal, address, isRestaurantOpen, restaurant],
  );

  /**
   * Switches the payment method automatically when the current choice stops being valid.
   *
   * The scenario: pick COD for an 800k order, then add items until it reaches 1.2 million
   * (COD is capped at 1 million). Without the automatic switch the user taps order and
   * gets a server error with no idea why.
   *
   * It sits in a useEffect because this is SYNCHRONISING state with a derived value —
   * one of the rare cases where useEffect is the right tool.
   */
  useEffect(() => {
    const valid = resolveValidMethod(
      paymentMethod,
      fees.total,
      getCurrentPlatform(),
    );
    if (valid !== paymentMethod) {
      setPaymentMethod(valid);
    }
  }, [fees.total, paymentMethod, setPaymentMethod]);

  return {
    cart,
    address,
    restaurant,
    voucher,
    vouchers: vouchers ?? [],
    paymentMethod,
    note,
    fees,
    /** Whether the breakdown is still the client's estimate or the server's official figure. */
    isQuoting: quote.isFetching,
    blockers,
    canPlaceOrder: blockers.length === 0 && !quote.isFetching,
  };
}
