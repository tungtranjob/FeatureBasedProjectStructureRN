import type {PaymentMethod} from '../model/types';
import {cardProvider} from './card/card.provider';
import {codProvider} from './cod/cod.provider';
import {momoProvider} from './momo/momo.provider';
import type {PaymentProvider} from './provider.types';
import {vnpayProvider} from './vnpay/vnpay.provider';

/**
 * BẢNG TRA PROVIDER.
 *
 * `Record<PaymentMethod, PaymentProvider>` chứ không phải object thường:
 * thêm một giá trị vào union PaymentMethod mà quên viết provider thì
 * TypeScript báo lỗi biên dịch ngay. Compiler làm thay việc review.
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
