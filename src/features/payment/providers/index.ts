import type {PaymentMethod} from '../model/types';
import {cardProvider} from './card/card.provider';
import {codProvider} from './cod/cod.provider';
import {momoProvider} from './momo/momo.provider';
import type {PaymentProvider} from './provider.types';
import {vnpayProvider} from './vnpay/vnpay.provider';

/**
 * THE PROVIDER LOOKUP TABLE.
 *
 * `Record<PaymentMethod, PaymentProvider>` rather than a plain object:
 * add a value to the PaymentMethod union and forget to write its provider and
 * TypeScript fails the build. The compiler does the review for you.
 */
const PROVIDERS: Record<PaymentMethod, PaymentProvider> = {
  COD: codProvider,
  MOMO: momoProvider,
  VNPAY: vnpayProvider,
  CARD: cardProvider,
};

export const resolveProvider = (method: PaymentMethod): PaymentProvider =>
  PROVIDERS[method];

export type {PaymentProvider} from './provider.types';
