/** The checkout feature's PUBLIC API. */
export {CheckoutScreen} from './screens/CheckoutScreen';
export {VoucherPickerScreen} from './screens/VoucherPickerScreen';
export {CHECKOUT_ROUTES} from './navigation/checkout.routes';
export type {CheckoutStackParamList} from './navigation/checkout.routes';
export {calcOrderTotal} from './model/calc-order-total';
export {validateCheckout, canPlaceOrder} from './model/validate-checkout';
export type {CheckoutBlocker} from './model/validate-checkout';

import {useCheckoutStore} from './store/checkout.store';

/** Resets the checkout draft (called from app/bootstrap on sign-out). */
export const resetCheckoutDraft = (): void =>
  useCheckoutStore.getState().reset();
