/** The payment feature's PUBLIC API. */
export {PaymentProcessingScreen} from './screens/PaymentProcessingScreen';
export {PaymentMethodList} from './components/PaymentMethodList';
export {PAYMENT_ROUTES, paymentLinking} from './navigation/payment.routes';
export type {PaymentStackParamList} from './navigation/payment.routes';
export {useInitiatePayment} from './hooks/use-pay';
export {usePaymentReturn} from './hooks/use-payment-return';
export {
  getAvailableMethods,
  getMethodInfo,
  resolveValidMethod,
} from './model/payment-method.registry';
export {getCurrentPlatform} from './lib/current-platform';
export type {AppPlatform} from './lib/current-platform';
export type {
  PaymentIntent,
  PaymentMethod,
  PaymentStatus,
  PaymentFlowStatus,
} from './model/types';

import {usePaymentStore} from './store/payment.store';

/** Whether any transaction is still in flight (used by app/bootstrap). */
export const hasPendingPayment = (): boolean =>
  usePaymentStore.getState().pendingIntentId !== null;
