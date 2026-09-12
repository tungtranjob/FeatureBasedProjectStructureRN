import {create} from 'zustand';
import type {PaymentMethod} from '@features/payment';

/**
 * THE CHECKOUT DRAFT — client state, and DELIBERATELY NOT PERSISTED.
 *
 * Compare it with the app's other three stores to see that the persistence decision
 * is not always the same:
 *
 *   cart.store      -> persisted. Losing the cart means re-picking every item.
 *   auth.store      -> persisted. Forcing a login on every launch is awful.
 *   payment.store   -> persisted. MANDATORY, because money is involved.
 *   checkout.store  -> NOT persisted. The voucher may have expired and the payment
 *                      method may no longer suit the new cart. Restoring an old
 *                      choice only causes confusion, and the defaults are cheap to
 *                      recompute.
 *
 * The rule of thumb: only persist what would annoy the user to lose OR what would
 * corrupt data if lost. Persisting everything "just in case" creates its own class of
 * stale-data bugs.
 */
interface CheckoutState {
  voucherId: string | null;
  paymentMethod: PaymentMethod;
  note: string;

  setVoucher: (voucherId: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNote: (note: string) => void;
  reset: () => void;
}

const INITIAL = {
  voucherId: null,
  paymentMethod: 'COD' as PaymentMethod,
  note: '',
};

export const useCheckoutStore = create<CheckoutState>()(set => ({
  ...INITIAL,

  setVoucher: voucherId => set({voucherId}),
  setPaymentMethod: paymentMethod => set({paymentMethod}),
  setNote: note => set({note}),
  reset: () => set(INITIAL),
}));
